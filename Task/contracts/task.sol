// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

contract TaskManager {
    struct Task {
        uint256 id;
        string title;
        bool completed;
    }

    uint256 public nextTaskId;
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => bool) private taskExists;

    event TaskCreated(uint256 indexed id, string title);
    event TaskUpdated(uint256 indexed id, string title, bool completed);
    event TaskDeleted(uint256 indexed id);

    modifier taskMustExist(uint256 _id) {
        require(taskExists[_id], "Task does not exist");
        _;
    }

    function createTask(string memory _title) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");

        uint256 taskId = nextTaskId;
        tasks[taskId] = Task(taskId, _title, false);
        taskExists[taskId] = true;
        nextTaskId++;

        emit TaskCreated(taskId, _title);
        return taskId;
    }

    function getTask(uint256 _id) public view taskMustExist(_id) returns (Task memory) {
        return tasks[_id];
    }

    function updateTask(uint256 _id, string memory _title) public taskMustExist(_id) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        tasks[_id].title = _title;
        emit TaskUpdated(_id, _title, tasks[_id].completed);
    }

    function markCompleted(uint256 _id) public taskMustExist(_id) {
        tasks[_id].completed = true;
        emit TaskUpdated(_id, tasks[_id].title, true);
    }

    function deleteTask(uint256 _id) public taskMustExist(_id) {
        taskExists[_id] = false;
        emit TaskDeleted(_id);
    }

    function getAllTasks() public view returns (Task[] memory) {
        Task[] memory result = new Task[](nextTaskId);
        for (uint256 i = 0; i < nextTaskId; i++) {
            if (taskExists[i]) {
                result[i] = tasks[i];
            }
        }
        return result;
    }
}