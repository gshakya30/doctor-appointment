var { UserSchema } = require("./../model/user");
var { DoctorSchema } = require("./../model/doctor");
var { AppointmentSchema } = require("./../model/appointment");
var jwt = require("jsonwebtoken");

var bcrypt = require("bcrypt");
const saltRounds = 10;

signupUser = function (user) {
  return new Promise((resolve, reject) => {
    console.log(user);
    if (user.userType == "doctor") {
      const doctorModel = new DoctorSchema(user);

      DoctorSchema.find(
        {
          email: user.email,
        },
        (err, userData) => {
          if (err) {
            reject(err);
          }
          if (userData.length > 0) {
            reject("Doctor with this email already exists");
          } else {
            bcrypt.hash(user.password, saltRounds, function (err, hash) {
              if (err) {
                reject(err);
              }
              doctorModel.password = hash;
              doctorModel
                .save()
                .then((data) => {
                  let userTemp = {
                    email: user.email,
                  };
                  const token = jwt.sign(
                    userTemp,
                    process.env.ACCESS_TOKEN_KEY
                  );
                  let result = JSON.parse(JSON.stringify(data));
                  delete result.password;
                  result["token"] = token;
                  resolve(result);
                })
                .catch((err) => {
                  reject(err);
                });
            });
          }
        }
      );
    } else {
      const userModel = new UserSchema(user);

      UserSchema.find(
        {
          email: user.email,
        },
        (err, userData) => {
          if (err) {
            reject(err);
          }
          if (userData.length > 0) {
            reject("User with this email already exists");
          } else {
            bcrypt.hash(user.password, saltRounds, function (err, hash) {
              if (err) {
                reject(err);
              }
              userModel.password = hash;
              userModel
                .save()
                .then((data) => {
                  let userTemp = {
                    email: user.email,
                  };
                  const token = jwt.sign(
                    userTemp,
                    process.env.ACCESS_TOKEN_KEY
                  );
                  let result = JSON.parse(JSON.stringify(data));
                  delete result.password;
                  result["token"] = token;
                  resolve(result);
                })
                .catch((err) => {
                  reject(err);
                });
            });
          }
        }
      );
    }
  });
};

authenticateUser = function (user) {
  return new Promise((resolve, reject) => {
    if (user.userType == "doctor") {
      DoctorSchema.findOne(
        {
          email: user.email,
        },
        function (err, data) {
          if (err) {
            reject(err);
          }
          console.log(data);
          if (!!data) {
            bcrypt.compare(user.password, data.password, function (err, res) {
              if (err) {
                reject(err);
              }
              if (res) {
                let result = JSON.parse(JSON.stringify(data));
                delete result.password;
                let userTemp = {
                  email: user.email,
                };
                const token = jwt.sign(userTemp, process.env.ACCESS_TOKEN_KEY);
                result["token"] = token;
                console.log(result);
                resolve(result);
              } else {
                reject("Wrong Password !!");
              }
            });
          } else {
            reject("User not exist !!");
          }
        }
      );
    } else {
      const userModel = new UserSchema(user);

      UserSchema.findOne(
        {
          email: user.email,
        },
        function (err, data) {
          if (err) {
            reject(err);
          }
          if (!!data) {
            bcrypt.compare(user.password, data.password, function (err, res) {
              if (err) {
                reject(err);
              }
              if (res) {
                let result = JSON.parse(JSON.stringify(data));
                delete result.password;
                let userTemp = {
                  email: user.email,
                };
                const token = jwt.sign(userTemp, process.env.ACCESS_TOKEN_KEY);
                console.log(token);
                console.log(process.env.ACCESS_TOKEN_KEY);
                result["token"] = token;
                console.log(result);
                resolve(result);
              } else {
                reject("Wrong Password !!");
              }
            });
          } else {
            reject("User not exist !!");
          }
        }
      );
    }
  });
};

getAvailableDoctor = function (filter) {
  return new Promise((resolve, reject) => {
    let medIssue = filter.medIssue;

    DoctorSchema.aggregate(
      [
        {
          $match: {
            $text: {
              $search: medIssue,
            },
          },
        },
        {
          $lookup: {
            from: "appointment",
            let: {
              doctor_email: "$email",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$doctor_email"],
                      },
                      {
                        appointmentDate: filter.date,
                      },
                    ],
                  },
                },
              },
              {
                $addFields: {
                  appointmentCount: {
                    $cond: {
                      if: {
                        $isArray: "$approvedList",
                      },
                      then: {
                        $size: "$approvedList",
                      },
                      else: 0,
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  appointmentCount: 1,
                },
              },
            ],
            as: "appointmentAvailibilty",
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ["$appointmentAvailibilty", 0],
                },
                "$$ROOT",
              ],
            },
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            specialization: 1,
            phone: 1,
            city: 1,
            appointmentCount: 1,
          },
        },
      ],
      function (err, data) {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(data);
      }
    );
  });
};

bookAppointment = function (bookDetail) {
  return new Promise((resolve, reject) => {
    let userDetail = bookDetail.user;
    let doctorDetail = bookDetail.doctor;
    userDetail["date"] = bookDetail.date;

    AppointmentSchema.findOneAndUpdate(
      {
        email: doctorDetail.email,
        name: doctorDetail.name,
        appointmentDate: bookDetail.date,
      },
      {
        $addToSet: {
          pendingList: userDetail,
        },
      },
      {
        new: true,
        upsert: true,
      },
      function (err, data) {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(data);
      }
    );
  });
};

getAppointmentDetails = function (doctor) {
  return new Promise((resolve, reject) => {
    let filter = {};
    filter["name"] = doctor.name;
    filter["email"] = doctor.email;
    filter["appointmentDate"] = {
      $gte: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      ).toDateString(),
    };
    console.log(JSON.stringify(filter));
    AppointmentSchema.find(filter, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

approveAppointment = function (id, user) {
  return new Promise((resolve, reject) => {
    AppointmentSchema.update(
      {
        _id: id,
      },
      {
        $pull: {
          pendingList: {
            name: user.name,
            email: user.email,
          },
        },
        $push: {
          approvedList: user,
        },
      },
      function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
};

module.exports = {
  signupUser,
  authenticateUser,
  getAvailableDoctor,
  bookAppointment,
  getAppointmentDetails,
  approveAppointment,
};
