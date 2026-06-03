const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TaskManager", function () {
  let taskManager;
  let owner;

  beforeEach(async function () {
    const TaskManager = await ethers.getContractFactory("TaskManager");
    taskManager = await TaskManager.deploy();
    [owner] = await ethers.getSigners();
  });

  describe("createTask", function () {
    it("Should create a task with correct properties", async function () {
      const tx = await taskManager.createTask("Buy groceries");
      const receipt = await tx.wait();

      const task = await taskManager.getTask(0);
      expect(task.id).to.equal(0);
      expect(task.title).to.equal("Buy groceries");
      expect(task.completed).to.be.false;
    });

    it("Should increment nextTaskId", async function () {
      await taskManager.createTask("Task 1");
      expect(await taskManager.nextTaskId()).to.equal(1);

      await taskManager.createTask("Task 2");
      expect(await taskManager.nextTaskId()).to.equal(2);
    });

    it("Should return the created task id", async function () {
      const tx = await taskManager.createTask("New task");
      const receipt = await tx.wait();

      expect(receipt).to.not.be.null;
    });

    it("Should emit TaskCreated event", async function () {
      await expect(taskManager.createTask("Event test"))
        .to.emit(taskManager, "TaskCreated")
        .withArgs(0, "Event test");
    });

    it("Should reject empty title", async function () {
      await expect(taskManager.createTask("")).to.be.revertedWith(
        "Title cannot be empty"
      );
    });
  });

  describe("getTask", function () {
    beforeEach(async function () {
      await taskManager.createTask("Test task");
    });

    it("Should return task details", async function () {
      const task = await taskManager.getTask(0);
      expect(task.title).to.equal("Test task");
    });

    it("Should revert for non-existent task", async function () {
      await expect(taskManager.getTask(999)).to.be.revertedWith(
        "Task does not exist"
      );
    });
  });

  describe("updateTask", function () {
    beforeEach(async function () {
      await taskManager.createTask("Original title");
    });

    it("Should update task title", async function () {
      await taskManager.updateTask(0, "Updated title");
      const task = await taskManager.getTask(0);
      expect(task.title).to.equal("Updated title");
    });

    it("Should emit TaskUpdated event", async function () {
      await expect(taskManager.updateTask(0, "New title"))
        .to.emit(taskManager, "TaskUpdated")
        .withArgs(0, "New title", false);
    });

    it("Should revert for non-existent task", async function () {
      await expect(taskManager.updateTask(999, "Title")).to.be.revertedWith(
        "Task does not exist"
      );
    });

    it("Should reject empty title", async function () {
      await expect(taskManager.updateTask(0, "")).to.be.revertedWith(
        "Title cannot be empty"
      );
    });
  });

  describe("markCompleted", function () {
    beforeEach(async function () {
      await taskManager.createTask("Task to complete");
    });

    it("Should mark task as completed", async function () {
      await taskManager.markCompleted(0);
      const task = await taskManager.getTask(0);
      expect(task.completed).to.be.true;
    });

    it("Should emit TaskUpdated event", async function () {
      await expect(taskManager.markCompleted(0))
        .to.emit(taskManager, "TaskUpdated")
        .withArgs(0, "Task to complete", true);
    });

    it("Should revert for non-existent task", async function () {
      await expect(taskManager.markCompleted(999)).to.be.revertedWith(
        "Task does not exist"
      );
    });
  });

  describe("deleteTask", function () {
    beforeEach(async function () {
      await taskManager.createTask("Task to delete");
    });

    it("Should delete a task", async function () {
      await taskManager.deleteTask(0);
      await expect(taskManager.getTask(0)).to.be.revertedWith(
        "Task does not exist"
      );
    });

    it("Should emit TaskDeleted event", async function () {
      await expect(taskManager.deleteTask(0))
        .to.emit(taskManager, "TaskDeleted")
        .withArgs(0);
    });

    it("Should revert for non-existent task", async function () {
      await expect(taskManager.deleteTask(999)).to.be.revertedWith(
        "Task does not exist"
      );
    });
  });

  describe("getAllTasks", function () {
    it("Should return empty array initially", async function () {
      const tasks = await taskManager.getAllTasks();
      expect(tasks.length).to.equal(0);
    });

    it("Should return all created tasks", async function () {
      await taskManager.createTask("Task 1");
      await taskManager.createTask("Task 2");
      await taskManager.createTask("Task 3");

      const tasks = await taskManager.getAllTasks();
      expect(tasks.length).to.equal(3);
      expect(tasks[0].title).to.equal("Task 1");
      expect(tasks[1].title).to.equal("Task 2");
      expect(tasks[2].title).to.equal("Task 3");
    });

    it("Should handle deleted tasks correctly", async function () {
      await taskManager.createTask("Task 1");
      await taskManager.createTask("Task 2");
      await taskManager.deleteTask(0);

      const tasks = await taskManager.getAllTasks();
      expect(tasks.length).to.equal(2);
      expect(tasks[0].id).to.equal(0);
      expect(tasks[1].title).to.equal("Task 2");
    });
  });

  describe("Integration", function () {
    it("Should handle complete task lifecycle", async function () {
      // Create
      await taskManager.createTask("Lifecycle task");
      let task = await taskManager.getTask(0);
      expect(task.completed).to.be.false;

      // Update
      await taskManager.updateTask(0, "Updated lifecycle task");
      task = await taskManager.getTask(0);
      expect(task.title).to.equal("Updated lifecycle task");

      // Complete
      await taskManager.markCompleted(0);
      task = await taskManager.getTask(0);
      expect(task.completed).to.be.true;

      // Delete
      await taskManager.deleteTask(0);
      await expect(taskManager.getTask(0)).to.be.revertedWith(
        "Task does not exist"
      );
    });
  });
});
