// controllers/authController.js
//const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = CONFIG.AUTHJWT.secret || process.env.JWT_SECRET;
const JWT_EXPIRES_IN = CONFIG.expires || "6h";



module.exports = {
    loginUser: function (reqData, callback) {
        const email = reqData.email;
        const password = reqData.password;

        const rules = {
            email: "required|email",
            password: "required"
        };

        const validation = validateRule(reqData, rules);

        if (!validation.status) {
            return callback({ status: false, errors: validation.errors });
        }

        if (!email || !password) {
            return callback({ status: false, msg: "Email and password required" });
        }

        // Fetch user from MySQL using global helper
        global.db_selectQ(
            "users",
            ["id", "name", "email", "password", "role", "blocked"],
            { email: email, blocked: 'false' },
            null,
            function (rows) {
                if (!rows || rows.length === 0) {

                    return callback({ status: false, msg: "Invalid email or password" });
                }

                const user = rows[0];

                console.log(user);


                if (user.blocked === "true" || user.blocked === 1) {
                    return callback({ status: false, msg: "User is blocked" });
                }

                //const isValid = bcrypt.compareSync(password, user.password);

                if (password !== user.password) {
                    return callback({ status: false, msg: "Invalid email or password" });
                }



                // Create JWT
                const tokenPayload = {
                    id: user.id,
                    email: user.email,
                    role: user.role
                };

                const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

                const safeUser = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                };

                callback({
                    status: true,
                    msg: "Login statusful",
                    data: {
                        user: safeUser,
                        token: token
                    }
                });
            }
        );
    }
};
