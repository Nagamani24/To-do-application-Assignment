const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever is starting at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};

initializeDbAndServer();
const listOfPriorities = ["LOW", "MEDIUM", "HIGH"];
const listOfStatus = ["TO DO", "IN PROGRESS", "DONE"];

let checkStatusPresence = (a) => {
  for (let each in listOfStatus) {
    if (each === a) {
      console.log(each);
      break;
    }
  }
};

convertToPascalCase = (each) => {
  return {
    id: each.id,
    todo: each.todo,
    priority: each.priority,
    status: each.status,
    category: each.category,
    dueDate: each.due_date,
  };
};

//API 1

app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q } = request.query;

  if (status !== undefined && priority !== undefined) {
    if (
      (status === "TO DO") |
      (status === "IN PROGRESS") |
      (status === "DONE")
    ) {
      if (
        (priority === "LOW") |
        (priority === "MEDIUM") |
        (priority === "HIGH")
      ) {
        const getStatusPriorityQuery = `SELECT *
                                      FROM todo
                                      WHERE (status = '${status}' and priority = '${priority}');`;
        const getStatusPriority = await db.all(getStatusPriorityQuery);
        response.send(
          getStatusPriority.map((each) => convertToPascalCase(each))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }
  if (status !== undefined && category !== undefined) {
    if (
      (status === "TO DO") |
      (status === "IN PROGRESS") |
      (status === "DONE")
    ) {
      if (
        (category === "HOME") |
        (category === "LEARNING") |
        (category === "WORK")
      ) {
        const getStatusCategoryQuery = `SELECT *
                                      FROM todo
                                      WHERE (status = '${status}' and category ='${category}');`;
        const getStatusCategory = await db.all(getStatusCategoryQuery);
        response.send(
          getStatusCategory.map((each) => convertToPascalCase(each))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }
  if (priority !== undefined && category !== undefined) {
    if (
      (priority === "LOW") |
      (priority === "MEDIUM") |
      (priority === "HIGH")
    ) {
      if (
        (category === "HOME") |
        (category === "LEARNING") |
        (category === "WORK")
      ) {
        const getPriorityCategoryQuery = `SELECT *
                                      FROM todo
                                      WHERE (priority = '${priority}' and category ='${category}');`;
        const getPriorityCategory = await db.all(getPriorityCategoryQuery);
        response.send(
          getPriorityCategory.map((each) => convertToPascalCase(each))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  if (
    status !== undefined &&
    (priority === undefined || category === undefined)
  ) {
    if (
      (status === "TO DO") |
      (status === "IN PROGRESS") |
      (status === "DONE")
    ) {
      const getStatusQuery = `SELECT *
                                  FROM todo
                                  WHERE status = '${status}';`;
      const getStatus = await db.all(getStatusQuery);
      response.send(getStatus.map((each) => convertToPascalCase(each)));
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }
  if (
    (status === undefined || category === undefined) &&
    priority !== undefined
  ) {
    if (
      (priority === "LOW") |
      (priority === "MEDIUM") |
      (priority === "HIGH")
    ) {
      const getPriorityQuery = `SELECT *
                                  FROM todo
                                  WHERE priority = '${priority}';`;
      const getPriority = await db.all(getPriorityQuery);
      response.send(getPriority.map((each) => convertToPascalCase(each)));
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  if (
    category !== undefined &&
    (priority === undefined || status === undefined)
  ) {
    if (
      (category === "WORK") |
      (category === "HOME") |
      (category === "LEARNING")
    ) {
      const getCategoryQuery = `SELECT *
                                  FROM todo
                                  WHERE category = '${category}';`;
      const getCategory = await db.all(getCategoryQuery);
      response.send(getCategory.map((each) => convertToPascalCase(each)));
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }
  if (search_q !== undefined) {
    const getSearchQuery = `SELECT *
                                FROM todo
                                WHERE todo LIKE '%${search_q}%';`;
    const getSearchDetails = await db.all(getSearchQuery);
    response.send(getSearchDetails.map((each) => convertToPascalCase(each)));
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoIdDetailsQuery = `SELECT *
                                      FROM todo
                                      WHERE id = ${todoId};`;
  const getTodoIdDetails = await db.get(getTodoIdDetailsQuery);
  response.send({
    id: getTodoIdDetails.id,
    todo: getTodoIdDetails.todo,
    priority: getTodoIdDetails.priority,
    status: getTodoIdDetails.status,
    category: getTodoIdDetails.category,
    dueDate: getTodoIdDetails.due_date,
  });
});

//API 3

app.get("/agenda/", async (request, response) => {
  //const { date } = request.query;

  const result = isValid(new Date(2021 - 12 - 12));
  let dueDate = format(new Date(2021, 12, 12), "yyyy-MM-dd");
  //dueDate = JSON.stringify(date);

  if (result === true) {
    const getDueDatedTodoListQuery = `SELECT *
                                         FROm todo
                                         WHERE due_date = ${dueDate};`;
    const getDueDatedTodoList = await db.all(getDueDatedTodoListQuery);
    response.send({
      id: getDueDatedTodoList.id,
      todo: getDueDatedTodoList.todo,
      priority: getDueDatedTodoList.priority,
      status: getDueDatedTodoList.status,
      category: getDueDatedTodoList.category,
      dueDate: getDueDatedTodoList.due_date,
    });
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const createToDoQuery = `INSERT INTO todo(id,todo,priority,status,category,due_date)
                              VALUES(6,'${todo}','${priority}','${status}','${category}','${dueDate}');`;
  const createToDo = await db.run(createToDoQuery);
  response.send("Todo Successfully Added");
});

//API 5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, category, priority, status, dueDate } = request.body;
  if (todo !== undefined) {
    const updateTodoQuery = `UPDATE todo
                               SET todo = '${todo}'
                               WHERE id = ${todoId};`;
    const updateTodo = await db.run(updateTodoQuery);
    response.send("Todo Updated");
  } else if (category !== undefined) {
    const updateCategoryQuery = `UPDATE todo
                               SET category = '${category}'
                               WHERE id = ${todoId};`;
    const updateCategory = await db.run(updateCategoryQuery);
    response.send("Category Updated");
  } else if (priority !== undefined) {
    const updatePriorityQuery = `UPDATE todo
                               SET priority = '${priority}'
                               WHERE id = ${todoId};`;
    const updatePriority = await db.run(updatePriorityQuery);
    response.send("Priority Updated");
  } else if (status !== undefined) {
    const updateStatusQuery = `UPDATE todo
                               SET status = '${status}'
                               WHERE id = ${todoId};`;
    const updateStatus = await db.run(updateStatusQuery);
    response.send("Status Updated");
  } else if (dueDate !== undefined) {
    const updateDateQuery = `UPDATE todo
                               SET due_date = '${dueDate}'
                               WHERE id = ${todoId};`;
    const updateDate = await db.run(updateDateQuery);
    response.send("Due Date Updated");
  }
});

//API 6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo
                                WHERE id = ${todoId};`;
  const deleteTodo = await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
