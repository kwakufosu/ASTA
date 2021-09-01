const mysql = require("mysql");

const {
  sendReportEmail,
  AssignEmail,
  RemarkEmail,
} = require("../../emails/account");
//Connection Pool
const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true,
});
//view Users
exports.view = (req, res) => {
  //Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection
    connection.query("SELECT * FROM user", (err, rows) => {
      //When done with the connection, release it
      connection.release();

      if (!err) {
        let removedUser = req.query.removed;
        res.render("index", { rows, removedUser });
      } else {
        console.log(err);
      }
    });
  });
};

exports.login = (req, res) => {
  res.render("login", { layout: "login" });
};

exports.loginCheck = (req, res) => {
  const { password, email } = req.body;
  console.log(password, email);
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection
    const sql =
      "SELECT * FROM user WHERE email LIKE ? AND password LIKE ?;SELECT * FROM user WHERE role='staff';SELECT request.id,user.first_name, user.last_name,comments,issue.issue_name,category.category_name,request.eng_remark FROM user LEFT JOIN request ON user.id=request.user_id JOIN issue ON issue.id=request.issue_id JOIN category ON category.id=request.category_id";
    connection.query(sql, [email, password], (err, rows) => {
      connection.release();

      const row = JSON.parse(JSON.stringify(rows));

      const row2 = row[2];
      let row1 = row[1];
      const row0 = row[0];

      //const row
      if (row[0][0].role === "supervisor") {
        console.log(row[1]);
        res.render("index", { row1: row2 });
      } else if (row[0][0].role === "staff") {
        res.render("view-user", { layout: "staff", rows: row0 });
        console.log(row0);
      } else if (row[0][0].role === "engineer") {
        res.render("view-engineer", { layout: "engineer", rows: row0 });
      } else {
        res.send({ err });
      }
    });
  });
};

//Find user by search
// exports.find = (req, res) => {
//   //Connect to DB
//   pool.getConnection((err, connection) => {
//     if (err) throw err;
//     console.log("Connected as ID" + connection.threadId);

//     let searchTerm = req.body.search;
//     //Use the connection
//     connection.query(
//       "SELECT * FROM user WHERE first_name LIKE ? OR last_name LIKE ?",
//       ["%" + searchTerm + "%", "%" + searchTerm + "%"],
//       (err, rows) => {
//         //When done with the connection, release it
//         connection.release();

//         if (!err) {
//           res.render("index", { rows });
//         } else {
//           console.log(err);
//         }
//       }
//     );
//   });
// };

//Report Issue

//Render form

exports.form = (req, res) => {
  //Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection
    connection.query(
      "SELECT * FROM user WHERE id=?;SELECT * FROM issue;SELECT * FROM category",
      [req.params.id],
      (err, rows) => {
        //When done with the connection, release it
        connection.release();

        const row = JSON.parse(JSON.stringify(rows));
        const row2 = row[2];
        const row1 = row[1];
        const row0 = row[0];

        if (!err) {
          res.render("reportIssue", {
            layout: "staff",
            rows: row0,
            row1: row1,
            row2: row2,
          });
        } else {
          console.log(err);
        }
      }
    );
  });
};

//Create form
exports.create = (req, res) => {
  console.log(req.body);
  const { comments, issue, category } = req.body;

  const issueArr = issue.split(/[^0-9a-zA-Z]+/g);
  const issueID = issueArr[0];

  const catArr = category.split(/[^0-9a-zA-Z]+/g);
  const catID = catArr[0];

  //Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection
    connection.query(
      "INSERT INTO request(id,comments,issue_id,category_id,user_id) VALUES (NULL,?,?,?,?);SELECT * FROM user WHERE id=?;",
      [comments, issueID, catID, req.params.id, req.params.id],
      (err, rows) => {
        //When done with the connection, release it
        connection.release();

        const row = JSON.parse(JSON.stringify(rows));

        const row1 = row[1];
        const row0 = row[0];

        if (!err) {
          res.render("reportIssue", {
            layout: "staff",
            rows: row1,
            alert: "Issue reported successfully",
          });
        } else {
          console.log(err);
        }
      }
    );
  });
};

// exports.edit = (req, res) => {
//   pool.getConnection((err, connection) => {
//     if (err) throw err;
//     console.log("Connected as ID" + connection.threadId);

//     connection.query(
//       "SELECT first_name,last_name,email,phone,branch FROM user,request WHERE user.id = request.user_id",
//       [req.params.id],
//       (err, rows) => {
//         if (!err) {
//           res.render("edit-user", { rows });
//         } else {
//           console.log(err);
//         }
//         console.log("The data from user table: \n", rows);
//       }
//     );
//   });
// };

//Update User

// exports.update = (req, res) => {
//   const { first_name, last_name, email, phone, branch } = req.body;
//   //Connect to DB
//   pool.getConnection((err, connection) => {
//     if (err) throw err;
//     console.log("Connected as ID" + connection.threadId);
//     //Use the connection
//     connection.query(
//       "UPDATE user SET first_name=?, last_name=?,email=?,phone=?, branch=? WHERE id=?",
//       [first_name, last_name, email, phone, branch, req.params.id],
//       (err, rows) => {
//         //When done with the connection, release it
//         connection.release();

//         if (!err) {
//           //Connect to DB
//           pool.getConnection((err, connection) => {
//             if (err) throw err;
//             console.log("Connected as ID" + connection.threadId);
//             //Use the connection
//             connection.query(
//               "SELECT * FROM user WHERE id=?",
//               [req.params.id],
//               (err, rows) => {
//                 //When done with the connection, release it
//                 connection.release();

//                 if (!err) {
//                   res.render("edit-user", {
//                     rows,
//                     alert: `${first_name} has been updated`,
//                   });
//                 } else {
//                   console.log(err);
//                 }
//                 console.log("The data from user table: \n", rows);
//               }
//             );
//           });
//         } else {
//           console.log(err);
//         }
//         console.log("The data from user table: \n", rows);
//       }
//     );
//   });
// };

//Delete User
exports.delete = (req, res) => {
  //Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection
    connection.query(
      "DELETE FROM request WHERE id=?",
      [req.params.id],
      (err, rows) => {
        //When done with the connection, release it
        connection.release();

        if (!err) {
          res.render("index", { alert: "Request successfully removed." });
        } else {
          console.log(err);
        }
        console.log("The data from user table: \n", rows);
      }
    );
  });
};

//viewall
exports.viewall = (req, res) => {
  //Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection

    const sql =
      "SELECT request.id, first_name,last_name FROM request,user WHERE request.id=? AND request.eng_id=user.id";
    connection.query(
      //"SELECT * FROM user WHERE id=?",
      sql,
      [req.params.id],
      (err, rows) => {
        //When done with the connection, release it
        connection.release();

        console.log(rows);
        if (!err) {
          res.render("view-supervisor", { rows });
        } else {
          console.log(err);
        }
      }
    );
  });
};

//Assignment
exports.assign_form = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);

    //Use the connection
    const sql =
      "SELECT request.id,first_name,last_name,phone,email,branch FROM user,request WHERE role='staff' AND request.id=?;SELECT * FROM user WHERE role='engineer' ";
    connection.query(sql, [req.params.id, req.params.id], (err, rows) => {
      //When done with the connection, release it
      connection.release();
      const row = JSON.parse(JSON.stringify(rows));

      const row1 = row[1];
      const row0 = row[0];
      console.log(row0);
      if (!err) {
        //AssignEmail(first_name, last_name, email, serial_num, user_id);
        res.render("assignment", { rows: row0, row: row1 });
      } else {
        console.log(err);
      }
      console.log("The data from user table: \n", rows);
    });
  });
};

exports.create_assign = (req, res) => {
  console.log(req.body);

  //Connect to DB
  pool.getConnection((err, connection) => {
    const { assign } = req.body;
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    const engArr = assign.split(/[^0-9a-zA-Z]+/g);
    console.log(engArr);
    const engID = engArr[0];
    console.log(req.params.id);
    //Use the connection
    const sql =
      "SELECT * FROM user WHERE role='staff';UPDATE request SET eng_id=?  WHERE request.id=?; ";
    connection.query(sql, [engID, req.params.id], (err, rows) => {
      //When done with the connection, release it
      console.log(rows);
      connection.release();
      const row = JSON.parse(JSON.stringify(rows));

      const row0 = row[0];
      if (!err) {
        //AssignEmail(first_name, last_name, email, serial_num, user_id);
        res.render("assignment", {
          rows: row0,
          alert: "Assignment successful",
        });
      } else {
        console.log(err);
      }
      console.log("The data from user table: \n", rows);
    });
  });
};

//Add Issue
exports.addissue = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection

    const sql = "SELECT * FROM issue ";
    connection.query(
      sql,

      (err, rows) => {
        //When done with the connection, release it
        connection.release();

        console.log(rows);
        if (!err) {
          res.render("addissue", { rows });
        } else {
          console.log(err);
        }
      }
    );
  });
};

exports.saveIssue = (req, res) => {
  const { issue } = req.body;
  //Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection

    const sql =
      "INSERT INTO issue(id,issue_name) VALUES (NULL,?);SELECT * FROM issue;";
    connection.query(
      //"SELECT * FROM user WHERE id=?",
      sql,
      [issue],
      (err, rows) => {
        //When done with the connection, release it
        connection.release();
        const row = JSON.parse(JSON.stringify(rows));

        const row1 = row[1];
        const row0 = row[0];
        console.log(rows);
        if (!err) {
          res.render("addissue", { alert: "Issue Added", rows: row1 });
        } else {
          console.log(err);
        }
      }
    );
  });
};

//Add Issue
exports.addCategory = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection

    const sql = "SELECT * FROM category ";
    connection.query(
      sql,

      (err, rows) => {
        //When done with the connection, release it
        connection.release();

        console.log(rows);
        if (!err) {
          res.render("addcat", { rows });
        } else {
          console.log(err);
        }
      }
    );
  });
};

exports.saveCategory = (req, res) => {
  const { category } = req.body;
  //Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection

    const sql =
      "INSERT INTO category(id,category_name) VALUES (NULL,?); SELECT * FROM category";
    connection.query(
      //"SELECT * FROM user WHERE id=?",
      sql,
      [category],
      (err, rows) => {
        //When done with the connection, release it
        connection.release();
        const row = JSON.parse(JSON.stringify(rows));

        const row1 = row[1];
        const row0 = row[0];

        console.log(rows);
        if (!err) {
          res.render("addcat", { alert: "Category Added", rows: row1 });
        } else {
          console.log(err);
        }
      }
    );
  });
};
