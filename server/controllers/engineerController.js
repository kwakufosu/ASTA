const mysql = require("mysql");
const express = require("express");
const router = express.Router();

//Connection Pool
const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

exports.viewAssign = (req, res) => {
  //Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection
    const sql =
      "SELECT request.id,first_name,last_name,date,comments,issue_name,category_name,eng_remark FROM user,request,issue,category WHERE user.id=request.user_id AND request.issue_id=issue.id AND request.category_id=category.id;SELECT * FROM user,request where request.eng_id=user.id";
    connection.query(sql, (err, rows) => {
      //When done with the connection, release it
      connection.release();
      const row = JSON.parse(JSON.stringify(rows));

      const row1 = row[1];
      const row0 = row[0];
      console.log(row1);
      if (!err) {
        res.render("assignment-history", { layout: "engineer", rows: row0 });
      } else {
        console.log(err);
      }
      console.log("The data from user table: \n", rows);
    });
  });
};

exports.remark = (req, res) => {
  //Connect to DB
  console.log(req.params.id);
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection
    connection.query(
      "SELECT request.id ,first_name,last_name,email,phone FROM request ,user WHERE user.id=request.user_id",
      [req.params.id],
      (err, rows) => {
        //When done with the connection, release it
        connection.release();

        if (!err) {
          res.render("remark", { rows, layout: "engineer" });
        } else {
          console.log(err);
        }
      }
    );
  });
};

exports.remarksave = (req, res) => {
  console.log(req.body, req.params.id);
  const { first_name, comments } = req.body;
  //Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected as ID" + connection.threadId);
    //Use the connection
    connection.query(
      "SELECT request.id ,first_name,last_name,email,phone FROM request ,user WHERE user.id=request.user_id;UPDATE request SET request.eng_remark=? WHERE request.id=? ",
      [comments,req.params.id],
      (err, rows) => {
        //When done with the connection, release it
        connection.release();

        if (!err) {
          //Connect to DB
          pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log("Connected as ID" + connection.threadId);
            //Use the connection
            connection.query(
              "SELECT * FROM user WHERE id=?",
              [req.params.id],
              (err, rows) => {
                //When done with the connection, release it
                connection.release();

                if (!err) {
                  res.render("remark", {
                    rows: rows,
                    alert: `Remark on ${first_name} has been saved`,
                    layout: "engineer",
                  });
                } else {
                  console.log(err);
                }
                
              }
            );
          });
        } else {
          console.log(err);
        }
      }
    );
  });
};
