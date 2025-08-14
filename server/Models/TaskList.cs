namespace server.Models
{
    public class TaskList
    {
        public int Id{ get; set; }
        public string Name { get; set; }
        public List<Task> Tasks { get; set; } = new List<Task>();

    }
    public class Task
        {
            public int Id{ get; set; }
            public string Name { get; set; }
            public bool Completed { get; set; }
        }
}