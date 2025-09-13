using System.Text.Json.Serialization;

namespace server.Models
{
    public class TaskList
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<Task> Tasks { get; set; } = new List<Task>();

        public int Position { get; set; } // position of the task list in the board, used for drag and drop functionality

        [JsonIgnore]
        public int BoardId { get; set; }

        [JsonIgnore]
        public Board Board { get; set; }

    }
    public class Task
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Completed { get; set; }
        public int Position { get; set; } // position of the task in the task list, used for drag and drop functionality

        [JsonIgnore]
        public int TaskListId { get; set; }

        [JsonIgnore]
        public TaskList TaskList { get; set; }
    }
    public class TaskDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Completed { get; set; }
        public int Position { get; set; }
    }
}