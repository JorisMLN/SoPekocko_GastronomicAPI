/* - - - - - SAUCES CONTROLLERS - - - - - */

const Sauce = require('../models/sauces')
const fs = require('fs');



exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    console.log(sauceObject);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    console.log(sauce);
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body }
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject})
        .then(() => res.status(200).json({ message: 'objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.likeDislikeSauce = (req, res, next) => {
    console.log('start like dislike' + req.body.like);

    const likeObject = req.body;
    console.log("userId: " + likeObject.userId + " like: " + likeObject.like);

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            checkLikes(likeObject, sauce);
            console.log("checkLikes " + sauce.likes  + "checkheat " + sauce.heat);

            Sauce.updateOne({ _id: req.params.id }, sauce)
                .then(() => res.status(200).json({ message: 'objet updaté !' }))
                .catch(error => res.status(400).json({ error }));
        })

    function checkLikes(likeObject, sauce) {
        switch (likeObject.like) {
            case 1:
                {
                    sauce.likes++;
                    sauce.usersLiked.push(likeObject.userId);
                    // sauce.usersDisliked = sauce.usersDisliked.filter(userId => userId !== likeObject.userId);
                    let idIndex = sauce.usersDisliked.indexOf(likeObject.userId);
                    if (idIndex > -1) {
                        removeDislike(sauce, idIndex)
                    }
                    break;
                }
            case -1:
                {
                    sauce.dislikes++;
                    sauce.usersDisliked.push(likeObject.userId);
                    // sauce.usersDisliked = sauce.usersDisliked.filter(userId => userId !== likeObject.userId);
                    let idIndex = sauce.usersLiked.indexOf(likeObject.userId);
                    if (idIndex > -1) {
                        removeLike(sauce, idIndex)
                    }
                    break;
                }
            default:
                {
                    let idIndex = sauce.usersDisliked.indexOf(likeObject.userId);
                    if (idIndex > -1) {
                        removeDislike(sauce, idIndex)
                    }
                    else {
                        idIndex = sauce.usersLiked.indexOf(likeObject.userId);
                        removeLike(sauce, idIndex)
                    }
                    break;
                }
        }
    }

    function removeLike(sauce, idIndex) {
        sauce.usersLiked.splice(idIndex, 1);
        sauce.likes--;
    }
    function removeDislike(sauce, idIndex) {
        sauce.usersDisliked.splice(idIndex, 1);
        sauce.dislikes--;
    }
};

