namespace server.Models
{
    public class TaskList
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<Task> Tasks { get; set; } = new List<Task>();

        public int Position { get; set; } // position of the task list in the board, used for drag and drop functionality

    }
    public class Task
        {
            public int Id{ get; set; }
            public string Name { get; set; }
            public bool Completed { get; set; }
        }
}