import { renderHook, act, waitFor } from '@testing-library/react';
import { useUndoDelete } from './useUndoDelete';

// Mock the fetchWithRefresh function
jest.mock('../../Refresh.tsx', () => ({
  fetchWithRefresh: jest.fn(() => Promise.resolve({ ok: true }))
}));

// Mock navigate function
const mockNavigate = jest.fn();

describe('useUndoDelete', () => {
  const mockSetTaskLists = jest.fn();
  const mockBoardId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with no pending deletion and timer at 0', () => {
    const { result } = renderHook(() =>
      useUndoDelete([], mockSetTaskLists, mockBoardId, mockNavigate)
    );

    expect(result.current.pendingDeletion).toBeNull();
    expect(result.current.undoTimer).toBe(0);
  });

  describe('handleScheduleDelete', () => {
    it('sets pending deletion when called', () => {
      const { result } = renderHook(() =>
        useUndoDelete([], mockSetTaskLists, mockBoardId, mockNavigate)
      );

      act(() => {
        result.current.handleScheduleDelete(1, 2);
      });

      expect(result.current.pendingDeletion).toEqual({
        taskId: 1,
        taskListId: 2,
        boardId: mockBoardId
      });
    });

    it('resets timer when scheduling new deletion', () => {
      const { result } = renderHook(() =>
        useUndoDelete([], mockSetTaskLists, mockBoardId, mockNavigate)
      );

      // Set initial timer
      act(() => {
        result.current.handleScheduleDelete(1, 2);
        jest.advanceTimersByTime(1000); // Advance timer to 4 seconds
      });

      // Schedule new deletion
      act(() => {
        result.current.handleScheduleDelete(3, 4);
      });

      expect(result.current.undoTimer).toBe(5); // Timer resets to 5
    });
  });

  describe('undo functionality', () => {
    it('handles undo correctly when no pending deletion', () => {
      const { result } = renderHook(() =>
        useUndoDelete([], mockSetTaskLists, mockBoardId, mockNavigate)
      );

      // Should not crash when called with no pending deletion
      expect(() => {
        act(() => {
          result.current.handleUndoDelete();
        });
      }).not.toThrow();
    });

    it('restores task in task lists when undo is called', () => {
      const mockTaskLists = [
        {
          id: 2,
          tasks: [{ id: 1, name: 'Test Task' }]
        }
      ];

      const { result } = renderHook(() =>
        useUndoDelete(mockTaskLists, mockSetTaskLists, mockBoardId, mockNavigate)
      );

      // Schedule deletion
      act(() => {
        result.current.handleScheduleDelete(1, 2);
      });

      // Undo deletion
      act(() => {
        result.current.handleUndoDelete();
      });

      expect(mockSetTaskLists).toHaveBeenCalledWith(mockTaskLists);
      expect(result.current.pendingDeletion).toBeNull();
      expect(result.current.undoTimer).toBe(0);
    });
  });

  describe('timer functionality', () => {
    it('starts countdown when pending deletion is set', () => {
      const { result } = renderHook(() =>
        useUndoDelete([], mockSetTaskLists, mockBoardId, mockNavigate)
      );

      act(() => {
        result.current.handleScheduleDelete(1, 2);
      });

      // Timer should be at 5 initially
      expect(result.current.undoTimer).toBe(5);
    });

    it('counts down every second', () => {
      const { result } = renderHook(() =>
        useUndoDelete([], mockSetTaskLists, mockBoardId, mockNavigate)
      );

      act(() => {
        result.current.handleScheduleDelete(1, 2);
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.undoTimer).toBe(4);
    });

    it('reaches 0 after 5 seconds', () => {
      const { result } = renderHook(() =>
        useUndoDelete([], mockSetTaskLists, mockBoardId, mockNavigate)
      );

      act(() => {
        result.current.handleScheduleDelete(1, 2);
        jest.advanceTimersByTime(5000); // 5 seconds
      });

      expect(result.current.undoTimer).toBe(0);
    });

    it('clears interval when component unmounts', () => {
      const { result, unmount } = renderHook(() =>
        useUndoDelete([], mockSetTaskLists, mockBoardId, mockNavigate)
      );

      act(() => {
        result.current.handleScheduleDelete(1, 2);
      });

      unmount();

      // Timer interval should be cleared
      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(clearInterval).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleConfirmDelete', () => {
    it('makes API call to delete task when pending deletion exists', async () => {
      const mockTaskLists = [
        {
          id: 2,
          tasks: [{ id: 1, name: 'Test Task' }]
        }
      ];

      const { result } = renderHook(() =>
        useUndoDelete(mockTaskLists, mockSetTaskLists, mockBoardId, mockNavigate)
      );

      act(() => {
        result.current.handleScheduleDelete(1, 2);
      });

      await act(async () => {
        await result.current.handleConfirmDelete();
      });

      // Verify API call was made (mocked)
      expect(require('../../Refresh.tsx').fetchWithRefresh).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks/deletetask'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.any(Object),
          body: expect.stringContaining('TaskId:1')
        }),
        mockNavigate
      );

      // Verify task was removed from UI
      expect(mockSetTaskLists).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 2,
            tasks: expect.any(Array)
          })
        ])
      );

      expect(result.current.pendingDeletion).toBeNull();
      expect(result.current.undoTimer).toBe(0);
    });

    it('does nothing when no pending deletion', async () => {
      const { result } = renderHook(() =>
        useUndoDelete([], mockSetTaskLists, mockBoardId, mockNavigate)
      );

      await act(async () => {
        await result.current.handleConfirmDelete();
      });

      expect(mockSetTaskLists).not.toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
      const mockTaskLists = [
        {
          id: 2,
          tasks: [{ id: 1, name: 'Test Task' }]
        }
      ];

      // Mock API failure
      require('../../Refresh.tsx').fetchWith.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() =>
        useUndoDelete(mockTaskLists, mockSetTaskLists, mockBoardId, mockNavigate)
      );

      act(() => {
        result.current.handleScheduleDelete(1, 2);
      });

      await act(async () => {
        await result.current.handleConfirmDelete();
      });

      // Should still reset state even on error
      expect(result.current.pendingDeletion).toBeNull();
      expect(result.current.undoTimer).toBe(0);
    });
  });

  describe('timer countdown effect', () => {
    it('calls handleConfirmDelete when timer reaches 0', async () => {
      const mockTaskLists = [
        {
          id: 2,
          tasks: [{ id: 1, name: 'Test Task' }]
        }
      ];

      const { result } = renderHook(() =>
        useUndoDelete(mockTaskLists, mockSetTaskLists, mockBoardId, mockNavigate)
      );

      const originalHandleConfirmDelete = result.current.handleConfirmDelete;
      const mockHandleConfirmDelete = jest.fn(
        async () => await originalHandleConfirmDelete()
      );
      Object.defineProperty(result.current, 'handleConfirmDelete', {
        value: mockHandleConfirmDelete,
        writable: true
      });

      act(() => {
        result.current.handleScheduleDelete(1, 2);
        jest.advanceTimersByTime(5000); // Advance timer to 0
      });

      await waitFor(() => {
        expect(mockHandleConfirmDelete).toHaveBeenCalled();
      });
    });
  });
});