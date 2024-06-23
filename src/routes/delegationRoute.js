const express = require("express");
const router = express.Router();
const DelegationController = require("../controllers/delegationController");

router.post("/delegations", DelegationController.createDelegation);
router.get("/delegations", DelegationController.getDelegations);
router.delete("/delegations/:id", DelegationController.deleteDelegation);
router.patch("/delegations/:id", DelegationController.updateDelegation);
router.patch("/delegations/updateDelegations/:taskId/:userId", DelegationController.updateDelegationsByTaskAndUser);

module.exports = router;
