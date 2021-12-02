let express = require('express');
let router = express.Router();
const ticketsServices = require('../services/tickets')
const multer = require('multer')
const path = require("path");
const studentsServices = require("../services/students");
const fs = require("fs");

let privates = {
    verifyPhone: phone => {
        return !phone.match(/^[0][9][0-9]{9}$/);
    }
};
const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'))
    }, filename: function (req, file, cb) {
        const fileInfo = path.parse(file.originalname)
        cb(null, Date.now() + fileInfo.ext)
    },
})

const formatFilter = function (req, file, callback) {
    callback(null, true)
}

const uploadFileConfig = multer({
    storage: fileStorage, fileFilter: formatFilter
})
const uploadHandler = uploadFileConfig.single('file')


router.get('/availableTime', function (req, res) {
    if (typeof req.query.vaccineLink === 'undefined' ||typeof req.query.name === 'undefined' || typeof req.query.lastname === 'undefined' || typeof req.query.stdId === 'undefined' || typeof req.query.nationalCode === 'undefined' || typeof privates.verifyPhone(req.query.phoneNumber) === 'undefined') {
        res.status(400).send({
            success: false, error: "لطفا اطلاعات را کامل وارد کنید"
        });
    } else {
        let rsp = studentsServices.checkIfValid(req.query.stdId, req.query.nationalCode)
        if (rsp.status === -1) {
            res.status(400).send({
                success: false, error: "خطا! لطفا با شماره 09388148370 تماس بگیرید"
            });
        } else if (rsp.status === 0) {
            res.status(400).send({
                success: false, error: "دانشجو یافت نشد، درصورت خطا با شماره 44297590 تماس بگیرید."
            });
        } else {
            ticketsServices.availableTime(req.query.stdId, req.query.nationalCode, req.query.phoneNumber, (err, times) => {
                if (err) {
                    res.status(400).send({
                        success: false, error: "خطا! لطفا با شماره 09388148370 تماس بگیرید"
                    });
                } else {
                    res.status(200).send({
                        success: true, times: times
                    })
                }
            })
        }
    }
});

router.post('/uploadFile', uploadHandler, function (req, res) {
    let doc = req.file && req.file ? req.file.filename : null
    if (doc == null) {
        res.status(400).send({
            success: false, error: '.آپلود رسید با خطا روبرو شد. لطفا مجددا تلاش کنید'
        })
    } else {
        res.status(200).send({
            success: true, fileName: req.file.filename
        })
    }
});

router.post('/register', function (req, res) {
    if (typeof req.body.vaccineLink === 'undefined' || typeof req.body.reserve === 'undefined' || typeof req.body.paymentImage === 'undefined' || typeof req.body.stdId === 'undefined' || typeof req.body.nationalCode === 'undefined' || typeof privates.verifyPhone(req.body.phoneNumber) === 'undefined') {
        res.status(400).send({
            success: false, error: "لطفا اطلاعات را کامل وارد کنید"
        });
    } else {
        if (fs.existsSync(path.join(__dirname, '../uploads', req.body.paymentImage))) {
            let rsp = studentsServices.checkIfValid(req.body.stdId, req.body.nationalCode)
            if (rsp.status === -1) {
                res.status(400).send({
                    success: false, error: "خطا! لطفا با شماره 09388148370 تماس بگیرید"
                });
            } else if (rsp.status === 0) {
                res.status(400).send({
                    success: false, error: "دانشجو یافت نشد، درصورت خطا با شماره 44297590 تماس بگیرید."
                });
            } else {
                ticketsServices.register(req.body.vaccineLink,req.body.reserve, req.body.stdId, req.body.nationalCode, req.body.phoneNumber, req.body.paymentImage, (err, reservationCode) => {
                    if (err) {
                        res.status(400).send({
                            success: false, error: "خطا! لطفا با شماره 09388148370 تماس بگیرید"
                        });
                    } else {
                        res.status(200).send({
                            success: true, reservationCode: reservationCode
                        })
                    }
                })
            }
        } else {
            res.status(400).send({
                success: false, error: "فایل تصویر یافت نشد! لطفا مجددا آپلود کنید"
            });
        }
    }
});

module.exports = router;
