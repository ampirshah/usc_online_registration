let express = require('express');
let router = express.Router();
const {parse} = require('json2csv');
const tickets1Model = require("../models/tickets1");
const tickets2Model = require("../models/tickets2");
const fs = require("fs");
const path = require("path");
const archiver = require('archiver');


router.get('/first', function (req, res) {
    tickets1Model.find().lean().exec((err, tickets) => {
        if (err) {
            res.status(400).send({
                success: false, error: "خطا! لطفا با شماره 09388148370 تماس بگیرید"
            });
        } else {
            const fields = ["stdId", "nationalCode", "phoneNumber", "sans", "reservationCode", "filename", "vaccineLink"];
            const opts = {fields};

            try {
                const filePath = path.join(__dirname, "../first.csv");
                const csv = parse(tickets, opts);
                fs.writeFile(filePath, csv, function (err) {
                    if (err) {
                        return res.json(err).status(500);
                    } else {
                        setTimeout(function () {
                            fs.unlink(filePath, function (err) { // delete this file after 30 seconds
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }, 30000);
                        res.download(filePath);
                    }
                })
            } catch (err) {
                console.error(err);
            }
        }
    })
});

router.get('/second', function (req, res) {
    tickets2Model.find().lean().exec((err, tickets) => {
        if (err) {
            res.status(400).send({
                success: false, error: "خطا! لطفا با شماره 09388148370 تماس بگیرید"
            });
        } else {
            const fields = ["stdId", "nationalCode", "phoneNumber", "reservationCode", "filename", "vaccineLink"];
            const opts = {fields};

            try {
                const filePath = path.join(__dirname, "../second.csv");
                const csv = parse(tickets, opts);
                fs.writeFile(filePath, csv, function (err) {
                    if (err) {
                        return res.json(err).status(500);
                    } else {
                        setTimeout(function () {
                            fs.unlink(filePath, function (err) { // delete this file after 30 seconds
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }, 30000);
                        res.download(filePath);
                    }
                })
            } catch (err) {
                console.error(err);
            }
        }
    })
});

router.get('/files', function (req, res) {
    const source_dir = path.join(__dirname, "../../server/uploads");
    let output = fs.createWriteStream('files.zip');
    let archive = archiver('zip');

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        res.download(path.join(__dirname, "../files.zip"));
        console.log(path.join(__dirname, "../files.zip"))
    });

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(output);

// append files from a sub-directory, putting its contents at the root of archive
    archive.directory(source_dir, false);

// append files from a sub-directory and naming it `new-subdir` within the archive
    archive.directory('subdir/', 'new-subdir');

    archive.finalize();
});

module.exports = router;
