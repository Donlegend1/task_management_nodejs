var express = require('express');
const RolePermission = require('../../models').RolePermission;
const Permission = require('../../models').Permission;

class Helper {
    constructor() { }

    checkPermission(roleId, permName) {
        return new Promise(
            (resolve, reject) => {
                Permission.findOne({
                    where: {
                        permission_name: permName
                    }
                }).then((perm) => {
                    RolePermission.findOne({
                        where: {
                            role_id: roleId,
                            permission_id: perm.id
                        }
                    }).then((rolePermission) => {
                        // console.log(rolePermission);
                        if (rolePermission) {
                            resolve(rolePermission);
                        } else {
                            reject({ message: 'Forbidden' });
                        }
                    }).catch((error) => {
                        reject(error);
                    });
                }).catch(() => {
                    reject({ message: 'Forbidden' });
                });
            }
        );
    }
   
}

module.exports = Helper;
