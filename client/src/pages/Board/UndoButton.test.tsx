import { render, screen } from '@testing-library/react';
import { UndoButton } from './UndoButton';
import userEvent from '@testing-library/user-event';

describe('UndoButton', () => {
  const mockOnUndo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders null when no pending deletion', () => {
    const { container } = render(
      <UndoButton
        pendingDeletion={null}
        undoTimer={0}
        onUndo={mockOnUndo}
        taskName="Test Task"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders undo button when pending deletion exists', () => {
    const mockPendingDeletion = {
      taskId: 1,
      taskListId: 1,
      boardId: 1
    };

    render(
      <UndoButton
        pendingDeletion={mockPendingDeletion}
        undoTimer={3}
        onUndo={mockOnUndo}
        taskName="Test Task"
      />
    );

    expect(screen.getByText('Delete "Test Task"?')).toBeInTheDocument();
    expect(screen.getByText('Deleting in 3 seconds...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
  });

  it('displays correct timer when at 1 second', () => {
    const mockPendingDeletion = {
      taskId: 1,
      taskListId: 1,
      boardId: 1
    };

    render(
      <UndoButton
        pendingDeletion={mockPendingDeletion}
        undoTimer={1}
        onUndo={mockOnUndo}
        taskName="Test Task"
      />
    );

    expect(screen.getByText('Deleting in 1 second...')).toBeInTheDocument();
  });

  it('shows "Press Undo to cancel" when timer is 0', () => {
    const mockPendingDeletion = {
      taskId: 1,
      taskListId: 1,
      boardId: 1
    };

    render(
      <UndoButton
        pendingDeletion={mockPendingDeletion}
        undoTimer={0}
        onUndo={mockOnUndo}
        taskName="Test Task"
      />
    );

    expect(screen.getByText('Press Undo to cancel')).toBeInTheDocument();
    expect(screen.queryByText('Deleting in')).not.toBeInTheDocument();
  });

  it('calls onUndo when button is clicked', async () => {
    const mockPendingDeletion = {
      taskId: 1,
      taskListId: 1,
      boardId: 1
    };

    const user = userEvent.setup();
    render(
      <UndoButton
        pendingDeletion={mockPendingDeletion}
        undoTimer={3}
        onUndo={mockOnUndo}
        taskName="Test Task"
      />
    );

    const undoButton = screen.getByRole('button', { name: /undo/i });
    await user.click(undoButton);

    expect(mockOnUndo).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility attributes', () => {
    const mockPendingDeletion = {
      taskId: 1,
      taskListId: 1,
      boardId: 1
    };

    const { container } = render(
      <UndoButton
        pendingDeletion={mockPendingDeletion}
        undoTimer={3}
        onUndo={mockOnUndo}
        taskName="Test Task"
      />
    );

    const overlay = container.firstChild;
    expect(overlay).toHaveAttribute('class', expect.stringContaining('fixed'));
    expect(overlay).toHaveAttribute('class', expect.stringContaining('bottom-4'));
    expect(overlay).toHaveAttribute('class', expect.stringContaining('left-4'));
    expect(overlay).toHaveAttribute('class', expect.stringContaining('z-50'));
  });
});