/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/projects              ->  index
 * POST    /api/projects              ->  create
 * GET     /api/projects/:id          ->  show
 * PUT     /api/projects/:id          ->  upsert
 * PATCH   /api/projects/:id          ->  patch
 * DELETE  /api/projects/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {Project, Image, User, Se, Donation, ProjectCost, ProjectReward, sequelize} from '../../sqldb';
import multer from 'multer';
import $q from 'q';
import async from 'async'; 

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200; 
  return function (entity) {
    if(entity) {
      return res.status(statusCode)
        .json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if(entity) {
      return entity.destroy()
        .then(() => {
          res.status(204)
            .end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if(!entity) {
      res.status(404)
        .end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode)
      .send(err);
  };
}

function configureStorage() {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './client/assets/images/uploads/');
    },
    filename: function (req, file, cb) {
      file.timestamp = Date.now();
      var name = file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '');
      var format = file.originalname.split('.')[file.originalname.split('.').length - 1];
      cb(null, `${file.timestamp}-${name}.${format}`);
    }
  });
}

// Gets a list of Projects
export function index(req, res) {
  return Project.findAll({
    include: [{
      model: Image,
      as: 'images',
      order: [
        ['OrderIndex', 'ASC'],
      ],
      limit: 1,
      where: {
        IsExcluded: 0
      }
    }, {
      model: User,
      attributes: ['name'],
      as: 'leader'
    }, {
      model: User,
      attributes: ['name'],
      as: 'professor'
    }, {
      model: Donation,
      attributes: ['ProjectId'],
      as: 'donations',
      required: false,
      where: {
        IsApproved: 1
      }
    }],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('donations.DonationId')), 'DonationsNumber'],
        [sequelize.fn('SUM', sequelize.col('donations.ValueInCents')), 'DonationSum'],

      ],
      exclude: ['TeamMembers', 'Abstract', 'Goals', 'Benefits', 'Schedule', 'Results', 'Rewards']
    },
    group: 'ProjectId',
    where: {
      IsApproved: 1,
      IsExcluded: 0
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

//Gets a list of all projects
export function indexAll(req, res) {
  return Project.findAll({
    include: [{
      model: Image,
      as: 'images',
      order: [
        ['OrderIndex', 'ASC'],
      ],
      limit: 1,
      where: {
        IsExcluded: 0
      }
    }, {
      model: User,
      attributes: ['name'],
      as: 'leader'
    }, {
      model: User,
      attributes: ['name'],
      as: 'professor'
    }, {
      model: Donation,
      attributes: ['ProjectId'],
      as: 'donations',
      required: false,
      where: {
        IsApproved: 1
      }
    }],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('donations.DonationId')), 'DonationsNumber']
      ],
      exclude: ['TeamMembers', 'Abstract', 'Goals', 'Benefits', 'Schedule', 'Results', 'Rewards']
    },
    group: 'ProjectId'
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Project from the DB
export function show(req, res) {
  return Project.find({
    include: [{
      model: Image,
      as: 'images',
      attributes: ['ImageId', 'Path', 'OrderIndex', 'Type'],
      required: false,
      where: {
        IsExcluded: 0
      }
    }, {
      model: User,
      attributes: ['name'],
      as: 'leader'
    }, {
      model: User,
      attributes: ['name'],
      as: 'professor'
    }, {
      model: Se,
      as: 'se'
    }, {
      model: ProjectCost,
      attributes: ['CostDescription', 'Quantity', 'UnitPriceInCents', 'ProjectCostId'],
      as: 'costs',
      required: false,
      where:{
        IsExcluded: 0
      }
    }, {
      model: ProjectReward,
      attributes: ['RewardDescription', 'ValueInCents', 'IsUpperBound', 'ProjectRewardId'],
      as: 'rewards',
      required: false,
      where:{
        IsExcluded:0
      }
    },  
    {
      model: Donation,
      attributes: ['DonationId', 'ProjectId', 'DonationDate', 'ShowName', 'ShowAmount', 'ValueInCents', 'DonatorName', 'DonatorId'],
      as: 'donations',
      required: false,
      include: [{
                model: User,
                as: 'donator',
                attributes: ['name', 'PersonId'],
            }],
      where: {
        IsApproved: 1
      }
    }],
    group: ['images.ImageId', 'costs.ProjectCostId', 'donations.DonationId', 'rewards.ProjectRewardId'],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('donations.DonationId')), 'DonationsNumber']
      ]
    },
    order: [
      [{model: Image, as: 'images'}, 'OrderIndex']
    ],
    where: {
      ProjectId: req.params.id,
      IsApproved: 1,
      IsExcluded: 0
    }
  })
    .then(project => {
      if (project) {
        return project.increment('Views', {by: 1});
      } else {
        return project;
      }
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Project from the DB for preview
export function preview(req, res) {
  var userId = req.user.PersonId;
  return Project.find({
    include: [{
      model: Image,
      as: 'images',
      attributes: ['ImageId', 'Path', 'OrderIndex', 'Type'],
      required: false,
      where: {
        IsExcluded: 0
      }
    }, {
      model: User,
      attributes: ['name'],
      as: 'leader'
    }, {
      model: User,
      attributes: ['name'],
      as: 'professor'
    }, {
      model: ProjectCost,
      attributes: ['CostDescription', 'Quantity', 'UnitPriceInCents', 'ProjectCostId'],
      as: 'costs',
      required: false,
      where:{
        IsExcluded: 0
      }
    }, {
      model: ProjectReward,
      attributes: ['RewardDescription', 'ValueInCents', 'ProjectRewardId'],
      as: 'rewards',
      required: false,
      where:{
        IsExcluded: 0
      }
    }, {
      model: Se,
      as: 'se'
    }], 
    order: [
      [{model: Image, as: 'images'}, 'OrderIndex']
    ],
    where: {
      ProjectId: req.params.id,
      SubmissionerId: userId,
      IsApproved: 0,
      // IsExcluded: 0
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Project from the DB for admin view
export function admin(req, res) {
  var userId = req.user.PersonId;
  return Project.find({
    include: [{
      model: Image,
      as: 'images',
      attributes: ['ImageId', 'Path', 'OrderIndex', 'Type'],
      required: false,
      where: {
        IsExcluded: 0
      }
    }, {
      model: User,
      attributes: ['name', 'email', 'Phone'],
      as: 'leader'
    }, {
      model: User,
      attributes: ['name', 'email', 'Phone'],
      as: 'professor'
    }, {
      model: User,
      attributes: ['name'],
      as: 'submissioner'
    }, {
      model: ProjectReward,
      attributes: ['RewardDescription', 'ValueInCents', 'IsUpperBound', 'ProjectRewardId'],
      as: 'rewards',
      required: false,
      where: {
        IsExcluded: 0
      }
    }, {
      model: ProjectCost,
      attributes: ['CostDescription', 'Quantity', 'UnitPriceInCents', 'ProjectCostId'],
      as: 'costs',
      required: false,
      where:{
        IsExcluded: 0
      }
    }, {
      model: Se,
      as: 'se'
    }],
    order: [
      [{model: Image, as: 'images'}, 'OrderIndex']
    ],
    where: {
      ProjectId: req.params.id,
      //SubmissionerId: userId,
      //IsApproved: 0,
      //IsExcluded: 0
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Get my submitted projects
export function me(req, res) {
  var userId = req.user.PersonId;
  return Project.findAll({
    include: [{
      model: Image,
      as: 'images',
      attributes: ['ImageId', 'Path', 'OrderIndex', 'Type'],
      required: false,
      where: {
        IsExcluded: 0
      }
    }, {
      model: User,
      attributes: ['name'],
      as: 'leader'
    }, {
      model: User,
      attributes: ['name'],
      as: 'professor'
    }, {
      model: Se,
      as: 'se'
    }],
    attributes: {exclude: ['TeamMembers', 'Abstract', 'Goals', 'Benefits', 'Schedule', 'Results', 'Rewards']},
    order: [
      [{model: Image, as: 'images'}, 'OrderIndex']
    ],
    where: {
      SubmissionerId: userId,
      // IsExcluded: 0 
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list with semesters
export function menu(req, res) {
  return Project.findAll({
    attributes: [
      'Year',
      'Semester',
      'IsSpecial',
      'SpecialName',
      [sequelize.fn('COUNT', sequelize.col('ProjectId')), 'ProjectsNumber']
    ],
    group: ['Year', 'Semester', 'IsSpecial'],
    order: [
      ['Year', 'DESC'],
      ['Semester', 'DESC'],
      ['IsSpecial', 'DESC']
    ],
    raw: true,
    where: {
      IsApproved: true
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Project in the DB
export function create(req, res) {
  return Project.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Creates a new Project in the DB with his images
export function upload(req, res) {
  var upload = multer({
    storage: configureStorage()
  }).array('files', 13); // maxImages = 13

  upload(req, res, function (err) {
    var project = Project.build(req.body.project);
    var date = new Date();

    for(var fileIndex in req.files) {
      let name = req.files[fileIndex].filename;
      let format = name.split('.')[name.split('.').length - 1];

      if(format=='xlsx' || format=='xls'){
        project.setDataValue('Schedule', `assets/images/uploads/${name}`);
      }
    }

    project.setDataValue('IsApproved', 0);
    project.setDataValue('IsExcluded', 0);
    project.setDataValue('SubmissionerId', req.user.PersonId);
    // First semester: Dec to May, Second semester: Jun to Nov 
    project.setDataValue('Semester', (date.getMonth() >= 5 && date.getMonth() <= 10) ? 2 : 1); 
    project.setDataValue('Year', date.getFullYear());
    project.setDataValue('SubmissionDate', date.getTime());

    if(err) {
      console.log(err);
      res.json({errorCode: 1, errorDesc: err});
      return;
    }

    async.waterfall([
      //Trying to save 'Project' table
      (next)=>{
        console.log("PROJECT STEP");
        project.save().then(newProject => {
          console.log("'Project' saved");
          next(null, newProject.ProjectId);
        }).catch(e=>next(e));
      },
      //Trying to save 'Costs' table
      (projectId, next)=>{
        console.log("COSTS STEP");

        let costs=[];

        //Populate costs array
        if(Array.isArray(req.body.costs.Item)){
          for(var costIndex in req.body.costs.Item) {
            costs.push({
              ProjectId: projectId,
              CostDescription: req.body.costs.Item[costIndex],
              Quantity: req.body.costs.Quantity[costIndex],
              UnitPriceInCents: req.body.costs.UnitPrice[costIndex],
              IsExcluded: 0
            });
          }
        }else{
          costs.push({
            ProjectId: projectId,
            CostDescription: req.body.costs.Item,
            Quantity: req.body.costs.Quantity,
            UnitPriceInCents: req.body.costs.UnitPrice,
            IsExcluded: 0
          });
        }

        //Save to DB and call next
        if(costs.length > 0) {
          ProjectCost.bulkCreate(costs)
            .then(() => {
              console.log("'Costs' saved");
              next(null, projectId);
            })
            .catch(e=>next(e));
        }else{
          console.log("'Costs' is empty");
          next(null, projectId);
        }
      },
      //Trying to save 'Rewards' table
      (projectId, next)=>{
        console.log("REWARDS STEP");
        
        let rewards=[];

        //Populate rewards array
        if(Array.isArray(req.body.rewards.ValueInCents)){
          for(var rewardIndex in req.body.rewards.ValueInCents) {
            rewards.push({
              ProjectId: projectId,
              RewardDescription: req.body.rewards.RewardDescription[rewardIndex],
              IsUpperBound: req.body.rewards.IsUpperBound[rewardIndex],
              ValueInCents: req.body.rewards.ValueInCents[rewardIndex],
              IsExcluded: 0
            });
          }
        }
        else{
          rewards.push({
            ProjectId: projectId,
            RewardDescription: req.body.rewards.RewardDescription,
            IsUpperBound: req.body.rewards.IsUpperBound,
            ValueInCents: req.body.rewards.ValueInCents,
            IsExcluded: 0
          });
        }

        //Save to DB and call next
        if(rewards.length > 0) {
          ProjectReward.bulkCreate(rewards)
            .then(() => {
              console.log("'Rewards' saved");
              next(null, projectId);
            })
            .catch(e=>next(e));
        }else{
          console.log("'Rewards' is empty");
          next(null, projectId);
        }
      },
      //Trying to save 'Images' table
      (projectId, next)=>{
        console.log("IMAGES STEP");

        let images=[];

        //Populate images array
        for(var fileIndex in req.files) {
          let name = req.files[fileIndex].filename;
          let format = name.split('.')[name.split('.').length - 1];

          if(format!='xlsx' && format!='xls'){
            images.push({
              ProjectId: projectId,
              Path: `assets/images/uploads/${req.files[fileIndex].filename}`,
              Filename: req.files[fileIndex].filename,
              Type: 'project',
              Timestamp: req.files[fileIndex].timestamp,
              OrderIndex: fileIndex,
              IsExcluded: 0
            });
          }
        }

        //Save to DB and call next
        if(images.length > 0) {
          Image.bulkCreate(images)
            .then(() => {
              console.log("'Images' saved");
              next(null);
            })
            .catch(e=>next(e));
        }else{
          console.log("Images is empty");
          next(null);
        }
      },
    ], function(error) {
      if(error){
        console.log("Something went wrong!", error);
        handleError(res);
      }else{
        console.log("Everything is fine");
        res.json({errorCode: 0, errorDesc: null});
      }
    });
  });
}

// Edits an existing Project in the DB with his images
export function edit(req, res) {

  var upload = multer({
    storage: configureStorage()
  })
    .array('files', 13); // maxImages = 13

  upload(req, res, function (err) {
    if(err) {
      console.log(err);
      res.json({errorCode: 1, errorDesc: err});
      return;
    }

    var project = req.body.project;

    for(var fileIndex in req.files) {
      let name = req.files[fileIndex].filename;
      let format = name.split('.')[name.split('.').length - 1];

      if(format=='xlsx' || format=='xls'){
        project['Schedule']=`assets/images/uploads/${name}`;
      }
    }

    Reflect.deleteProperty(project, 'Results');
    Reflect.deleteProperty(project, 'SubmissionDate');
    Reflect.deleteProperty(project, 'SubmissionerId');
    Reflect.deleteProperty(project, 'CollectionLimitDate');

    console.log(`Searching project ${project.ProjectId}...`);
    Project.find({
      where: {
        ProjectId: project.ProjectId,
        SubmissionerId: req.user.PersonId,
        IsApproved: 0,
        IsExcluded: 0
      }
    })
      .then(oldProject => {
        console.log("Project found!");
        oldProject.update(project)
          .then(newProject => {
            console.log("Changes saved");

            var projectId = newProject.ProjectId;
            var costsToSave = req.body.costs;
            var promises = [];
            var uploadCosts = [];

            console.log("Searching Costs...");
            ProjectCost.findAll({
              where: {
                ProjectId: projectId,
                IsExcluded: 0
              }
            })
              .then(costs =>{
                console.log("Costs found!");

                for(let costIndex in costs){
                  costs[costIndex].IsExcluded = 1;
                  if(Array.isArray(costsToSave.Item)){
                    for(let searchIndex in costsToSave.Item){
                      if(parseInt(costs[costIndex].ProjectCostId) === parseInt(costsToSave.ProjectCostId[searchIndex])) {
                        costs[costIndex].IsExcluded = 0;
                        costs[costIndex].CostDescription = costsToSave.Item[searchIndex];
                        costs[costIndex].Quantity = costsToSave.Quantity[searchIndex];
                        costs[costIndex].UnitPriceInCents = costsToSave.UnitPrice[searchIndex];
                      }
                    }
                  }
                  else{
                    if(parseInt(costs[costIndex].ProjectCostId) === parseInt(costsToSave.ProjectCostId)){
                      costs[costIndex].IsExcluded = 0;
                      costs[costIndex].CostDescription = costsToSave.Item;
                      costs[costIndex].Quantity = costsToSave.Quantity;
                      costs[costIndex].UnitPriceInCents = costsToSave.UnitPrice;
                    }
                  }
                }
                for(let costIndex in costs){
                  promises.push(costs[costIndex].save());
                }

                //Adding new costs in database
                for(let costIndex in costsToSave.Item){
                  if(parseInt(costsToSave.ProjectCostId[costIndex]) === -1){
                    uploadCosts.push({
                      ProjectId: projectId,
                      CostDescription: costsToSave.Item[costIndex],
                      Quantity: costsToSave.Quantity[costIndex],
                      UnitPriceInCents: costsToSave.UnitPrice[costIndex],
                      IsExcluded: 0
                    })
                  }
                }
                if(uploadCosts.length > 0){
                  promises.push(ProjectCost.bulkCreate(uploadCosts));
                }
              })

            console.log("Searching Images...");
            Image.findAll({
              where: {
                ProjectId: projectId,
                Type: 'project',
                IsExcluded: 0
              }
            })
              .then(images => {
                console.log("Images found!");
                // TODO add promises waterfall

                // Removing images that user have chose
                var imagesToSave = req.body.savedImages;
                for(let imageIndex in images) {
                  images[imageIndex].IsExcluded = 1;
                  // Changing image OrderIndex knowing that index 0 is the principal image
                  for(let searchIndex in imagesToSave.ImageId) {                    
                    if(parseInt(images[imageIndex].ImageId) === parseInt(imagesToSave.ImageId[searchIndex])) {
                      images[imageIndex].IsExcluded = 0;
                      images[imageIndex].OrderIndex = imagesToSave.OrderIndex[searchIndex];
                    }
                    else if(parseInt(images[imageIndex].ImageId) === parseInt(imagesToSave.ImageId)){
                      images[imageIndex].IsExcluded = 0;
                      images[imageIndex].OrderIndex = parseInt(imagesToSave.OrderIndex);
                    }
                  }
                }

                for(let imageIndex in images) {
                  promises.push(images[imageIndex].save());
                }

                // Adding new images in database
                var uploadImages = [];
                for(var fileIndex in req.files) {
                  let name = req.files[fileIndex].filename;
                  let format = name.split('.')[name.split('.').length - 1];

                  if(format!='xlsx' && format!='xls'){
                    uploadImages.push({
                      ProjectId: projectId,
                      Path: `assets/images/uploads/${req.files[fileIndex].filename}`,
                      Filename: req.files[fileIndex].filename,
                      Type: 'project',
                      Timestamp: req.files[fileIndex].timestamp,
                      OrderIndex: req.body.uploadIndexes.OrderIndex[fileIndex],
                      IsExcluded: 0
                    });
                  }
                }
                if(uploadImages.length > 0) {
                  promises.push(Image.bulkCreate(uploadImages));
                }

                console.log("Updating changes...");
                $q.all(promises)
                  .then(() => {
                    console.log("Changes updated!");
                    res.json({errorCode: 0, errorDesc: null});
                  })
                  .catch(err => {
                    console.log("Something went wrong!");
                    console.log(err);
                    handleError(res);
                  });

              })
              .catch(handleError(res));

          })
          .catch(handleError(res));

      })
      .catch(handleError(res));

  });
}

// Edits any existing Project in the DB with his images (admin permission)
export function editAny(req, res) {

  var upload = multer({
    storage: configureStorage()
  })
    .array('files', 12); // maxImages = 12

  upload(req, res, function (err) {
    if(err) {
      console.log(err);
      res.json({errorCode: 1, errorDesc: err});
      return;
    }

    var project = req.body.project;
    Reflect.deleteProperty(project, 'Results');
    Reflect.deleteProperty(project, 'SubmissionDate');
    Reflect.deleteProperty(project, 'SubmissionerId');
    Reflect.deleteProperty(project, 'CollectionLimitDate');

    Project.find({
      where: {
        ProjectId: project.ProjectId
      }
    })
      .then(oldProject => {
        oldProject.update(project)
          .then(newProject => {

            var projectId = newProject.ProjectId;
            var costsToSave = req.body.costs;
            var rewardsToSave = req.body.rewards;
            var promises = [];
            var uploadCosts = [];
            var uploadRewards = [];

            if(newProject.Year >= 2019){
              ProjectCost.findAll({
                where: {
                  ProjectId: projectId,
                  IsExcluded: 0
                }
              })
                .then(costs =>{
                  for(let costIndex in costs){
                    costs[costIndex].IsExcluded = 1;

                    if(Array.isArray(costsToSave.Item)){
                      for(let searchIndex in costsToSave.Item){
                        if(parseInt(costs[costIndex].ProjectCostId) === parseInt(costsToSave.ProjectCostId[searchIndex])) {
                          costs[costIndex].IsExcluded = 0;
                          costs[costIndex].CostDescription = costsToSave.Item[searchIndex];
                          costs[costIndex].Quantity = costsToSave.Quantity[searchIndex];
                          costs[costIndex].UnitPriceInCents = costsToSave.UnitPrice[searchIndex];
                        }
                      }
                    }

                    else{
                      if(parseInt(costs[costIndex].ProjectCostId) === parseInt(costsToSave.ProjectCostId)){
                        costs[costIndex].IsExcluded = 0;
                        costs[costIndex].CostDescription = costsToSave.Item;
                        costs[costIndex].Quantity = costsToSave.Quantity;
                        costs[costIndex].UnitPriceInCents = costsToSave.UnitPrice;
                      }
                    }
                    
                  }

                  for(let costIndex in costs){
                    promises.push(costs[costIndex].save());
                  }
  
                  //Adding new costs in database
                  for(let costIndex in costsToSave.Item){
                    if(parseInt(costsToSave.ProjectCostId[costIndex]) === -1){
                      uploadCosts.push({
                        ProjectId: projectId,
                        CostDescription: costsToSave.Item[costIndex],
                        Quantity: costsToSave.Quantity[costIndex],
                        UnitPriceInCents: costsToSave.UnitPrice[costIndex],
                        IsExcluded: 0
                      })
                    }
                  }
                  
                  if(uploadCosts.length > 0){
                    promises.push(ProjectCost.bulkCreate(uploadCosts));
                  }
                })
            }

            ProjectReward.findAll({
              where: {
                ProjectId: projectId,
                IsExcluded: 0
              }
            })
              .then(rewards =>{
                for(let rewardIndex in rewards){
                  rewards[rewardIndex].IsExcluded = 1;
                  if(Array.isArray(rewardsToSave)){
                    for(let searchIndex in rewardsToSave){
                      if(parseInt(rewards[rewardIndex].ProjectRewardId) === parseInt(rewardsToSave[searchIndex].RewardId)) {
                        rewards[rewardIndex].IsExcluded = 0;
                        rewards[rewardIndex].RewardDescription = rewardsToSave[searchIndex].Item;
                        rewards[rewardIndex].Quantity = rewardsToSave[searchIndex].Quantity;
                        rewards[rewardIndex].UnitPriceInCents = rewardsToSave[searchIndex].UnitPrice;
                      }
                    }
                  }
                  else{
                    if(parseInt(rewards[rewardIndex].ProjectRewardId) === parseInt(rewardsToSave.RewardId)){
                      rewards[rewardIndex].IsExcluded = 0;
                      rewards[rewardIndex].RewardDescription = rewardsToSave.Item;
                      rewards[rewardIndex].Quantity = rewardsToSave.Quantity;
                      rewards[rewardIndex].UnitPriceInCents = rewardsToSave.UnitPrice;
                    }
                  }
                }
                for(let rewardIndex in rewards){
                  promises.push(rewards[rewardIndex].save());
                }

                //Adding new rewards in database
                for(let rewardIndex in rewardsToSave){
                  if(parseInt(rewardsToSave[rewardIndex].RewardId) === -1){
                    uploadRewards.push({
                      ProjectId: projectId,
                      RewardDescription: rewardsToSave[rewardIndex].RewardDescription,
                      IsUpperBound: rewardsToSave[rewardIndex].IsUpperBound,
                      ValueInCents: rewardsToSave[rewardIndex].ValueInCents,
                      IsExcluded: 0
                    })
                  }
                }
                console.log("upload rewards", uploadRewards);
                if(uploadRewards.length > 0){
                  promises.push(ProjectReward.bulkCreate(uploadRewards));
                }
              })
            

            Image.findAll({
              where: {
                ProjectId: projectId,
                Type: 'project',
                IsExcluded: 0
              }
            })
              .then(images => {
                // TODO add promises waterfall

                // Removing images that user have chose
                var imagesToSave = req.body.savedImages;
                for(let imageIndex in images) {
                  images[imageIndex].IsExcluded = 1;
                  console.log("savedImages");
                  console.log(JSON.stringify(imagesToSave));
                  // Changing image OrderIndex knowing that index 0 is the principal image
                  for(let searchIndex in imagesToSave.ImageId) {
                    if(parseInt(images[imageIndex].ImageId) === parseInt(imagesToSave.ImageId[searchIndex])) {
                      images[imageIndex].IsExcluded = 0;
                      images[imageIndex].OrderIndex = imagesToSave.OrderIndex[searchIndex];
                    }
                    else if(parseInt(images[imageIndex].ImageId) === parseInt(imagesToSave.ImageId)){
                      images[imageIndex].IsExcluded = 0;
                      images[imageIndex].OrderIndex = parseInt(imagesToSave.OrderIndex);
                    }
                  }
                }


                for(let imageIndex in images) {
                  promises.push(images[imageIndex].save());
                }

                // Adding new images in database
                var uploadImages = [];
                for(var fileIndex in req.files) {
                  uploadImages.push({
                    ProjectId: projectId,
                    Path: `assets/images/uploads/${req.files[fileIndex].filename}`,
                    Filename: req.files[fileIndex].filename,
                    Type: 'project',
                    Timestamp: req.files[fileIndex].timestamp,
                    OrderIndex: req.body.uploadIndexes.OrderIndex[fileIndex],
                    IsExcluded: 0
                  });
                }
                if(uploadImages.length > 0) {
                  promises.push(Image.bulkCreate(uploadImages));
                }

                $q.all(promises)
                  .then(() => {
                    res.json({errorCode: 0, errorDesc: null});
                  })
                  .catch(err => {
                    console.log(err);
                    handleError(res);
                  });

              })
              .catch(handleError(res));

          })
          .catch(handleError(res));

      })
      .catch(handleError(res));

  });
}

// Insert or update Results from an existing Project in the DB with his images
export function result(req, res) {

  var upload = multer({
    storage: configureStorage()
  })
    .array('files', 8); // maxImages = 8

  upload(req, res, function (err) {
    if(err) {
      console.log(err);
      res.json({errorCode: 1, errorDesc: err});
      return;
    }

    var project = req.body.project;
    Reflect.deleteProperty(project, 'IsApproved');
    Reflect.deleteProperty(project, 'IsExcluded');
    Reflect.deleteProperty(project, 'SubmissionDate');
    Reflect.deleteProperty(project, 'SubmissionerId');

    Project.find({
      where: {
        ProjectId: project.ProjectId,
        IsApproved: 1,
        IsExcluded: 0
      }
    })
      .then(oldProject => {
        oldProject.update(project, {
          fields: ['Results']
        })
          .then(newProject => {

            var projectId = newProject.ProjectId;

            Image.findAll({
              where: {
                ProjectId: projectId,
                Type: 'result',
                IsExcluded: 0
              }
            })
              .then(images => {

                var promises = [];

                // Removing images that user have chose
                var imagesToSave = req.body.savedImages;

                for(let imageIndex in images) {
                  images[imageIndex].IsExcluded = 1;

                  // Changing image OrderIndex knowing that index 0 is the principal image
                  for(let searchIndex in imagesToSave.ImageId) {
                    if(parseInt(images[imageIndex].ImageId) === parseInt(imagesToSave.ImageId[searchIndex])) {
                      images[imageIndex].IsExcluded = 0;
                      images[imageIndex].OrderIndex = imagesToSave.OrderIndex[searchIndex];
                    }
                  }
                }
                for(let imageIndex in images) {
                  promises.push(images[imageIndex].save());
                }

                // Adding new images in database
                var uploadImages = [];
                for(var fileIndex in req.files) {
                  uploadImages.push({
                    ProjectId: projectId,
                    Path: `assets/images/uploads/${req.files[fileIndex].filename}`,
                    Filename: req.files[fileIndex].filename,
                    Type: 'result',
                    Timestamp: req.files[fileIndex].timestamp,
                    OrderIndex: req.body.uploadIndexes.OrderIndex[fileIndex],
                    IsExcluded: 0
                  });
                }
                if(uploadImages.length > 0) {
                  promises.push(Image.bulkCreate(uploadImages));
                }

                $q.all(promises)
                  .then(() => {
                    res.json({errorCode: 0, errorDesc: null});
                  })
                  .catch(err => {
                    console.log(err);
                    handleError(res);
                  });

              })
              .catch(handleError(res));

          })
          .catch(handleError(res));

      })
      .catch(handleError(res));

  });
}

// Upserts the given Project in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.ProjectId) {
    Reflect.deleteProperty(req.body, 'ProjectId');
  }

  return Project.upsert(req.body, {
    where: {
      ProjectId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Project in the DB
export function patch(req, res) {
  if(req.body.ProjectId) {
    Reflect.deleteProperty(req.body, 'ProjectId');
  }
  return Project.find({
    where: {
      ProjectId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Project from the DB
export function destroy(req, res) {
  return Project.find({
    where: {
      ProjectId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
