// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

contract TaskManager {
    struct Task {
        uint256 id;
        string title;
        bool completed;
    }

    // Tasks are stored per owner address — no cross-wallet visibility.
    mapping(address => mapping(uint256 => Task)) private ownerTasks;
    mapping(address => mapping(uint256 => bool)) private taskExists;
    mapping(address => uint256) private nextTaskId;

    event TaskCreated(address indexed owner, uint256 indexed id, string title);
    event TaskUpdated(address indexed owner, uint256 indexed id, string title, bool completed);
    event TaskDeleted(address indexed owner, uint256 indexed id);

    modifier taskMustExist(uint256 _id) {
        require(taskExists[msg.sender][_id], "Task does not exist");
        _;
    }

    function createTask(string memory _title) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");

        uint256 taskId = nextTaskId[msg.sender];
        ownerTasks[msg.sender][taskId] = Task(taskId, _title, false);
        taskExists[msg.sender][taskId] = true;
        nextTaskId[msg.sender]++;

        emit TaskCreated(msg.sender, taskId, _title);
        return taskId;
    }

    function getTask(uint256 _id) public view taskMustExist(_id) returns (Task memory) {
        return ownerTasks[msg.sender][_id];
    }

    function updateTask(uint256 _id, string memory _title) public taskMustExist(_id) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        ownerTasks[msg.sender][_id].title = _title;
        emit TaskUpdated(msg.sender, _id, _title, ownerTasks[msg.sender][_id].completed);
    }

    function markCompleted(uint256 _id) public taskMustExist(_id) {
        ownerTasks[msg.sender][_id].completed = true;
        emit TaskUpdated(msg.sender, _id, ownerTasks[msg.sender][_id].title, true);
    }

    // Requires a signed transaction from the task owner — anyone else calling
    // this will hit the taskMustExist check (keyed to msg.sender) and revert.
    function deleteTask(uint256 _id) public taskMustExist(_id) {
        taskExists[msg.sender][_id] = false;
        delete ownerTasks[msg.sender][_id];
        emit TaskDeleted(msg.sender, _id);
    }

    // Takes an owner address so the read-only RPC can call this without a wallet.
    function getAllTasks(address _owner) public view returns (Task[] memory) {
        uint256 total = nextTaskId[_owner];
        uint256 count = 0;
        for (uint256 i = 0; i < total; i++) {
            if (taskExists[_owner][i]) count++;
        }
        Task[] memory result = new Task[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < total; i++) {
            if (taskExists[_owner][i]) {
                result[idx++] = ownerTasks[_owner][i];
            }
        }
        return result;
    }
}
