const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/projectController");
const multer = require('multer');
const path = require('path');

// Configuration de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../uploads/')); // Utilisez path.join pour éviter les erreurs de chemin
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5MB
  }).array('documents', 5);
  
  router.post("/projects", (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.error('Multer Error:', err);
        return res.status(500).json({ error: err.message });
      } else if (err) {
        console.error('Unknown Error:', err);
        return res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'upload des fichiers.' });
      }
      console.log('Files uploaded:', req.files); // Ajoutez ce log pour vérifier les fichiers uploadés
      ProjectController.createProject(req, res, next);
    });
  });
router.get("/projects", ProjectController.getProjects);
router.delete("/projects/:id", ProjectController.deleteProject);
router.patch("/projects/:id", ProjectController.updateProject);
router.patch("/deleteDocument/:id", ProjectController.deleteDocument);

module.exports = router;
