const tickets1Model = require("../models/tickets1");
const tickets2Model = require("../models/tickets2");
let methods = {};

let kavenegar = require("kavenegar");
let api = kavenegar.KavenegarApi({
    apikey: "66526E7236302B4544346451596B41654B7748546A6B6676656C344A6965704D",
});
let XLSX = require('xlsx')
let workbook = XLSX.readFile('./stdNumber.xlsx');
let sheet_name_list = workbook.SheetNames;
let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);


let privates = {
    sendLookupMessage: (code, phone) => {
        api.VerifyLookup({
            template: "USC", token: code, receptor: phone,
        }, (res, status) => {
            if (status !== 200) {
                console.log(status, res)
            }
        });
    }
};

methods.availableTime = (stdId, nationalCode, phoneNumber, callback) => {
    let t1Promise = new Promise((resolve, reject) => {
        tickets1Model.find().lean().exec((err, tickets) => {
            if (err) {
                reject()
            } else {
                let games = {"game1": 45, "game2": 45}
                tickets1Model.findOne({nationalCode: nationalCode}).lean().exec((err, std) => {
                    if (err) {
                        reject()
                    } else if (std) {
                        if (std.sans === 1) {
                            games['game1'] = -1
                        } else {
                            games['game2'] = -1
                        }
                    } else {
                        const t1 = tickets.filter(element => element.sans === 1);
                        const t2 = tickets.filter(element => element.sans === 2);
                        if (45 - t1.length < 1) {
                            games['game1'] = 0
                        } else {
                            games['game1'] = 45 - t1.length
                        }
                        if (45 - t2.length < 1) {
                            games['game2'] = 0
                        } else {
                            games['game2'] = 45 - t2.length
                        }
                    }
                    resolve(games)
                })
            }
        })
    })
    let t2Promise = new Promise((resolve, reject) => {
        let party = 0
        tickets2Model.findOne({nationalCode: nationalCode}).lean().exec((err, std) => {
            if (err) {
                reject()
            } else if (std) {
                party = -1
                resolve(party)
            } else {
                let reg
                if (stdId.length === 10) {
                    reg = `^400.*`
                } else {
                    reg = `^9${stdId[1]}.*`
                }
                tickets2Model.count({'stdId': {$regex: reg, $options: "im"}}).lean().exec((err, num) => {
                    if (err) {
                        reject()
                    } else {
                        let co = 0
                        if (stdId[0] === '4') {
                            co = 45
                        } else if (stdId[0] === '9') {
                            if (stdId[0] === '9') {
                                co = 35
                            } else if (stdId[0] === '8') {
                                co = 15
                            } else if (stdId[0] < '7') {
                                co = 20
                            }
                        }
                        if ((co - num) < 1) {
                            party = 0
                        } else {
                            party = co - num
                        }
                        resolve(party)
                    }
                })
            }

        })
    })
    Promise.all([t1Promise, t2Promise])
        .then((values) => {
            callback(null, {"game1": values[0]['game1'], "game2": values[0]['game2'], "party": values[1]})
        }).catch(() => {
        callback("خطا! لطفا با شماره 09388148370 تماس بگیرید", null)
    })
};

methods.register = (vaccineLink, reserve, stdId, nationalCode, phoneNumber, filename, callback) => {
    const found = xlData.find(element => parseInt(element.stdId) === parseInt(stdId) && parseInt(element.nationalCode) === parseInt(nationalCode));
    let name = found['نام']
    let lname = found['نام خانوادگي']
    let rnd = Math.floor(Math.random() * 90000) + 10000
    if (reserve['game1'] || reserve['game2']) {
        tickets1Model.findOne({nationalCode: nationalCode}).lean().exec((err, std) => {
            if (err) {
                callback("خطا! لطفا با شماره 09388148370 تماس بگیرید", null)
            } else if (std) {
                callback("شما قبلا برای این سانس رزرو ‌شده‌بودید!")
            } else {
                let sans = 0
                if (reserve['game1']) {
                    sans = 1
                } else {
                    sans = 2
                }
                const tickets1 = new tickets1Model({
                    stdId: stdId,
                    nationalCode: nationalCode,
                    phoneNumber: phoneNumber,
                    sans: sans,
                    reservationCode: rnd,
                    filename: filename,
                    vaccineLink: vaccineLink,
                    name:name,
                    lname:lname
                })
                tickets1.save((err) => {
                    if (err) {
                        callback("خطا! لطفا با شماره 09388148370 تماس بگیرید", null)
                    } else if (reserve['party']) {
                        tickets2Model.findOne({nationalCode: nationalCode}).lean().exec((err, std) => {
                            if (err) {
                                callback("خطا! لطفا با شماره 09388148370 تماس بگیرید", null)
                            } else if (std) {
                                callback("شما قبلا برای این سانس رزرو ‌شده‌بودید!")
                            } else {
                                const tickets2 = new tickets2Model({
                                    stdId: stdId,
                                    nationalCode: nationalCode,
                                    phoneNumber: phoneNumber,
                                    reservationCode: rnd,
                                    filename: filename,
                                    vaccineLink: vaccineLink,
                                    name:name,
                                    lname:lname
                                })

                                tickets2.save((err) => {
                                    if (err) {
                                        callback("خطا! لطفا با شماره 09388148370 تماس بگیرید", null)
                                    } else {
                                        callback(null, rnd)
                                        privates.sendLookupMessage(rnd, phoneNumber)
                                    }
                                })
                            }
                        })
                    } else {
                        callback(null, rnd)
                        privates.sendLookupMessage(rnd, phoneNumber)
                    }
                })
            }
        })
    } else {
        tickets2Model.findOne({nationalCode: nationalCode}).lean().exec((err, std) => {
            if (err) {
                callback("خطا! لطفا با شماره 09388148370 تماس بگیرید", null)
            } else if (std) {
                callback("شما قبلا برای این سانس رزرو ‌شده‌بودید!")
            } else {
                const tickets2 = new tickets2Model({
                    stdId: stdId,
                    nationalCode: nationalCode,
                    phoneNumber: phoneNumber,
                    reservationCode: rnd,
                    filename: filename,
                    vaccineLink: vaccineLink,
                    name:name,
                    lname:lname
                })
                tickets2.save((err) => {
                    if (err) {
                        callback("خطا! لطفا با شماره 09388148370 تماس بگیرید", null)
                    } else {
                        callback(null, rnd)
                        privates.sendLookupMessage(rnd, phoneNumber)
                    }
                })
            }
        })
    }
};


module.exports = methods;
