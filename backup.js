//POST: Create New Enrollment
exports.postCreateNewEnrollment = async (req, res) => {

    try {
        // Rest of the code for creating the enrollment record
        const { title_id, surname, first_name, middle_name, gender, passport_url, specimen_signature, country_id, state_id, lga_id, date_of_birth, permanent_home_address, university_attended, law_sch_camp_attended, year_of_admission_law_sch, year_of_call_to_bar, email, phone, alternative_name } = req.body;

        // Check if any required fields are empty
        if (!title_id || !surname || !first_name || !gender || !country_id || !state_id || !lga_id || !date_of_birth || !permanent_home_address || !university_attended || !law_sch_camp_attended || !year_of_admission_law_sch || !year_of_call_to_bar || !email || !phone) {
            return res.status(400).send(response.responseError(null, false, "Required fields are missing.", "Required fields are missing.", 400));
        } else {

            // get state
            const countryData = await Country.findOne({ where: { id: country_id } });
            // Checks if state exists
            if (countryData == null) {
                return res.status(400).send(response.responseError(null, false, "No country found!", "No country found!", 400));
            };

            // get state
            const stateData = await State.findOne({ where: { id: state_id } });
            // Checks if state exists
            if (stateData == null) {
                return res.status(400).send(response.responseError(null, false, "No state found!", "No state found!", 400));
            };

            // get local government
            const lgaData = await Lga.findOne({ where: { id: lga_id } });
            // Checks if local government exists
            if (lgaData == null) {
                return res.status(400).send(response.responseError(null, false, "No local government found!", "No local government found!", 400));
            };

            // get title by title id
            const titleData = await Title.findOne({ where: { id: title_id } });
            // Checks if title exists
            if (titleData == null) {
                return res.status(400).send(response.responseError(null, false, "No title found!", "No title found!", 400));
            };


            // Check if email already exists
            const existingEnrollment = await Enrollment.findOne({ where: { email } });
            if (existingEnrollment) {
                return res.status(400).send(response.responseError(null, false, "Email already exists.", "Email already exists.", 400));
            }

            // Initializing required variables
            let profilePictureFileName;
            let signatureFileName;
            let profilePicturePath;
            let signaturePath;
            let path1;
            let path2;


            // get upload path
            const passportRootPath = baseFunction.uploadPath("passport_url").data;
            const signatureRootPath = baseFunction.uploadPath("specimen_signature").data;

            // default profile picture path
            const defaultRoot = require('path').resolve("src/public/") + "/" + "default_profile_picture.png";
            const defaultEnrollmentPicturePath = Path.basename(defaultRoot);

            if (!req.files || Object.keys(req.files).length === 0) {
                console.log("no files to upload");
                // Create a new enrollment record in the database
                const enrolledUser = await Enrollment.create({
                    title_id,
                    surname,
                    first_name,
                    middle_name: middle_name ?? "",
                    gender,
                    // passport_url: pasport,
                    country_id,
                    state_id,
                    lga_id,
                    date_of_birth,
                    permanent_home_address,
                    university_attended,
                    law_sch_camp_attended,
                    year_of_admission_law_sch,
                    year_of_call_to_bar,
                    // specimen_signature: signature,
                    email,
                    status_id: 0,
                    phone,
                    alternative_name: alternative_name ?? ""
                });

                // get enrollment information
                const enrollmentData = await Enrollment.findOne({ where: { id: enrolledUser.id } });

                if (enrollmentData) {
                    res.status(200).send(response.responseSuccess(enrollmentData, true, "New Enrollment was created successfully.", "New Enrollment was created successfully.", 200));
                } else {
                    res.status(400).send(response.responseError([], false, "Sorry! Unable to retrieve new enrollment!", "Sorry! Unable to retrieve new enrollment!", 400));
                }

            } else {
                console.log("files to upload");
                const profilePicture = req.files.passport_url;
                const signature = req.files.specimen_signature;

                // check the profile photo size
                if (profilePicture) {
                    if (profilePicture.size <= 0) {
                        res.status(400).send(response.responseError(null, false, "the picture or signature file has no size, it might be corrupt", null, 400));
                    };
                };

                // check the signature size
                if (signature) {
                    if (signature.size <= 0) {
                        res.status(400).send(response.responseError(null, false, "the picture or signature file has no size, it might be corrupt", null, 400));
                    };
                };

                // generate name for signature and profile photo
                if (profilePicture) {
                    profilePictureFileName = Date.now() + Path.extname(profilePicture.name);
                };
                if (signature) {
                    signatureFileName = Date.now() + Path.extname(signature.name);
                };
                // profile picture and signature directory path
                path1 = passportRootPath + profilePictureFileName;
                path2 = signatureRootPath + signatureFileName;
                console.log('============passportRootPath========================');
                console.log(passportRootPath);
                console.log('====================================');

                // profile picture and signatiure path to save into database
                profilePicturePath = "/" + "passports" + "/" + profilePictureFileName;
                signaturePath = "/" + "signatures" + "/" + signatureFileName;

                // Create a new enrollment record in the database
                const enrolledUser = await Enrollment.create({
                    title_id,
                    surname,
                    first_name,
                    middle_name: middle_name ?? "",
                    gender,
                    // passport_url: pasport,
                    country_id,
                    state_id,
                    lga_id,
                    date_of_birth,
                    permanent_home_address,
                    university_attended,
                    law_sch_camp_attended,
                    year_of_admission_law_sch,
                    year_of_call_to_bar,
                    // specimen_signature: signature,
                    email,
                    status_id: 0,
                    phone,
                    alternative_name: alternative_name ?? ""
                });

                if (profilePicture) {
                    // Moving the  profile photo
                    await profilePicture.mv(path1, (err) => {
                        if (err) return res.status(400).send(response.responseError(err, false, "Could not upload passport", "An issue was encounterd when trying to upload passport", 400));

                        // Storing profile photo URL to DB
                        Enrollment.update({ passport_url: profilePicturePath }, {
                            where: {
                                id: enrolledUser.id
                            }
                        }).catch((error) => {
                            res.status(400).send(response.responseError(error, false, "Could not store passport", "An issue was encounterd when trying to store uploaded passport", 400));
                        })
                    })
                }
                // else {
                //     Enrollment.update({ passport_url: defaultEnrollmentPicturePath }, {
                //         where: {
                //             user_id: new_user.id
                //         }
                //     }).catch((error) => {
                //         res.status(400).send(response.responseError(error, false, "Could not store passport", "An issue was encounterd when trying to store uploaded passport", 400));
                //     })
                // };

                if (signature) {
                    //Moving the signature
                    await signature.mv(path2, (err) => {
                        if (err) return res.status(400).send(response.responseError(err, false, "Could not upload signatiure", "An issue was encounterd when trying to upload signatiure", 400));

                        // Storing signature URL to DB
                        Enrollment.update({ specimen_signature: signaturePath }, {
                            where: {
                                id: enrolledUser.id
                            }
                        }).catch((error) => {
                            res.status(400).send(response.responseError(error, false, "Could not store signature", "An issue was encounterd when trying to store uploaded signature", 400));
                        })
                    })
                };
                // get enrollment information
                const enrollmentData = await Enrollment.findOne({ where: { id: enrolledUser.id } });

                if (enrollmentData) {
                    res.status(200).send(response.responseSuccess(enrollmentData, true, "New Enrollment was created successfully.", "New Enrollment was created successfully.", 200));
                } else {
                    res.status(400).send(response.responseError([], false, "Sorry! Unable to retrieve new enrollment!", "Sorry! Unable to retrieve new enrollment!", 400));
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(response.responseError(error.message, false, "Sorry! create Enrollment unsuccessfully!", "Sorry! create Enrollment unsuccessfully!", 400));
    }
};
