const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const engineerController = require("../controllers/engineerController");

router.get("/", userController.login);
//router.post("/", userController.find);
router.post("/login", userController.loginCheck);
router.get("/delete/:id", userController.delete);
router.get("/login/assignment", engineerController.viewAssign);
router.get("/remark/:id", engineerController.remark);
router.post("/remark/:id", engineerController.remarksave);

router.get("/home", userController.view);



router.get("/reportIssue/:id", userController.form);
router.post("/reportIssue/:id", userController.create);

router.get("/assignment/:id", userController.assign_form);
router.post("/assignment/:id", userController.create_assign);

router.get("/viewsupervisor/:id", userController.viewall);

router.get("/index/:id", userController.delete);

router.get("/addissue", userController.addissue);
router.post("/addissue", userController.saveIssue);

router.get("/addcat", userController.addCategory);
router.post("/addcat", userController.saveCategory);

module.exports = router;
