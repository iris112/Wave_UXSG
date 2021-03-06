"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
const sequelize = new Sequelize('uxsg', 'root', 'root', {
    dialect: 'mysql',
    host: 'localhost',
    define: {
        charset: 'utf8',
        dialectOptions: {
            collate: 'utf8_general_ci'
        }
    },
});
// const sequelize = new Sequelize('uxsg', 'root', 'uxsgwallet', {
//   dialect: 'mysql',
//   host: 'aaz150gr01un72.clasgm1ienc0.us-east-2.rds.amazonaws.com',
//   define: {
//     charset: 'utf8',
//     dialectOptions: {
//       collate: 'utf8_general_ci'
//     }
//   },
// });
const User = sequelize.define('tbl_users', {
    name: Sequelize.STRING,
    fname: Sequelize.STRING,
    lname: Sequelize.STRING,
    email: Sequelize.STRING,
    pwd: Sequelize.STRING,
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
User.sync();
const Session = sequelize.define('tbl_sessions', {
    timestamp: Sequelize.DATE,
    userid: Sequelize.BIGINT,
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
Session.sync();
function get_user(name) {
    return User.findOne({
        where: {
            name: name
        }
    });
}
exports.get_user = get_user;
function register_user(name, fname, lname, email, pwd) {
    return User.create({
        name: name,
        fname: fname,
        lname: lname,
        email: email,
        pwd: pwd,
    });
}
exports.register_user = register_user;
function get_session(id) {
    return Session.findOne({
        where: {
            id: id
        }
    });
}
exports.get_session = get_session;
function add_session(timestamp, userid) {
    return Session.create({
        timestamp: timestamp,
        userid: userid,
    });
}
exports.add_session = add_session;
function delete_session(id) {
    return Session.destroy({
        where: {
            id: id
        }
    });
}
exports.delete_session = delete_session;
//# sourceMappingURL=dbMysql.js.map