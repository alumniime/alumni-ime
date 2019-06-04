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
      var name = file.originalname.replace(/[^a-zA-Z0-9]/, '');
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
      required: false
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
      required: false
    }, {
      model: User,
      attributes: ['name'],
      as: 'leader'
    }, {
      model: User,
      attributes: ['name'],
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
      ProjectId: req.params.id
      //SubmissionerId: userId,
      //IsApproved: 0,
      // IsExcluded: 0
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
      [sequelize.fn('COUNT', sequelize.col('ProjectId')), 'ProjectsNumber']
    ],
    group: ['Year', 'Semester'],
    order: [
      ['Year', 'DESC'],
      ['Semester', 'DESC'],
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
  })
    .array('files', 12); // maxImages = 12

  upload(req, res, function (err) {

    var project = Project.build(req.body.project);
    var date = new Date();

    project.setDataValue('IsApproved', 0);
    project.setDataValue('IsExcluded', 0);
    project.setDataValue('SubmissionerId', req.user.PersonId);
    // First semester: Dec to May, Second semester: Jun to Nov 
    project.setDataValue('Semester', (date.getMonth() >= 5 && date.getMonth() <= 10) ? 2 : 1); 
    project.setDataValue('Year', date.getFullYear());
    project.setDataValue('SubmissionDate', date.getTime());

    console.log(req.body.costs);

    
    if(err) {
      console.log(err);
      res.json({errorCode: 1, errorDesc: err});
      return;
    }
    project.save()
      .then(newProject => {
        var projectId = newProject.ProjectId;

        var images = [];
        var costs = [];

        console.log(req.body.costs);
        console.log(Array.isArray(req.body.costs.Item));

        if(Array.isArray(req.body.costs.Item)){
          for(var costIndex in req.body.costs.Item) {
            console.log(costIndex);
            costs.push({
              ProjectId: projectId,
              CostDescription: req.body.costs.Item[costIndex],
              Quantity: req.body.costs.Quantity[costIndex],
              UnitPriceInCents: req.body.costs.UnitPrice[costIndex],
              IsExcluded: 0
            });
          }
        }
        else{
          costs.push({
            ProjectId: projectId,
            CostDescription: req.body.costs.Item,
            Quantity: req.body.costs.Quantity,
            UnitPriceInCents: req.body.costs.UnitPrice,
            IsExcluded: 0
          });
        }

        if(costs.length > 0) {
          ProjectCost.bulkCreate(costs)
            .then(() => {
              res.json({errorCode: 0, errorDesc: null});
            })
            .catch(handleError(res));
        }

        for(var fileIndex in req.files) {
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

        if(images.length > 0) {
          Image.bulkCreate(images)
            .then(() => {
              res.json({errorCode: 0, errorDesc: null});
            })
            .catch(handleError(res));
        }

      })
      .catch(handleError(res));
  });
}

// Edits an existing Project in the DB with his images
export function edit(req, res) {

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
        ProjectId: project.ProjectId,
        SubmissionerId: req.user.PersonId,
        IsApproved: 0,
        IsExcluded: 0
      }
    })
      .then(oldProject => {
        oldProject.update(project)
          .then(newProject => {

            var projectId = newProject.ProjectId;
            var costsToSave = req.body.costs;
            var promises = [];
            var uploadCosts = [];

            ProjectCost.findAll({
              where: {
                ProjectId: projectId,
                IsExcluded: 0
              }
            })
              .then(costs =>{
                for(let costIndex in costs){
                  costs[costIndex].IsExcluded = 1;
                  console.log(costs);
                  console.log(costsToSave);
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
                console.log(costsToSave);
                console.log(costsToSave.Item);
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
                console.log(uploadCosts);
                if(uploadCosts.length > 0){
                  promises.push(ProjectCost.bulkCreate(uploadCosts));
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
                console.log("IMAGES");
                console.log(JSON.stringify(images));
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
                    console.log(costsToSave);
                    if(Array.isArray(costsToSave)){
                      for(let searchIndex in costsToSave){
                        if(parseInt(costs[costIndex].ProjectCostId) === parseInt(costsToSave[searchIndex].ProjectCostId)) {
                          costs[costIndex].IsExcluded = 0;
                          costs[costIndex].CostDescription = costsToSave[searchIndex].Item;
                          costs[costIndex].Quantity = costsToSave[searchIndex].Quantity;
                          costs[costIndex].UnitPriceInCents = costsToSave[searchIndex].UnitPrice;
                        }
                      }
                    }
                    //Entra aqui?
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
                  console.log(costsToSave);
                  for(let costIndex in costsToSave){
                    if(parseInt(costsToSave[costIndex].ProjectCostId) === -1){
                      uploadCosts.push({
                        ProjectId: projectId,
                        CostDescription: costsToSave[costIndex].Item,
                        Quantity: costsToSave[costIndex].Quantity,
                        UnitPriceInCents: costsToSave[costIndex].UnitPrice,
                        IsExcluded: 0
                      })
                    }
                  }
                  console.log(uploadCosts);
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
                      if(parseInt(rewards[rewardIndex].ProjectRewardId) === parseInt(rewardsToSave[searchIndex].ProjectRewardId)) {
                        rewards[rewardIndex].IsExcluded = 0;
                        rewards[rewardIndex].RewardDescription = rewardsToSave[searchIndex].Item;
                        rewards[rewardIndex].Quantity = rewardsToSave[searchIndex].Quantity;
                        rewards[rewardIndex].UnitPriceInCents = rewardsToSave[searchIndex].UnitPrice;
                      }
                    }
                  }
                  //Entra aqui?
                  else{
                    if(parseInt(rewards[rewardIndex].ProjectRewardId) === parseInt(rewardsToSave.ProjectRewardId)){
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
                console.log(rewardsToSave);
                for(let rewardIndex in rewardsToSave){
                  if(parseInt(rewardsToSave[rewardIndex].ProjectRewardId) === -1){
                    uploadRewards.push({
                      ProjectId: projectId,
                      RewardDescription: rewardsToSave[rewardIndex].Item,
                      Quantity: rewardsToSave[rewardIndex].Quantity,
                      UnitPriceInCents: rewardsToSave[rewardIndex].UnitPrice,
                      IsExcluded: 0
                    })
                  }
                }
                console.log(uploadRewards);
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
                console.log("IMAGES");
                console.log(JSON.stringify(images));
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
        SubmissionerId: req.user.PersonId,
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
