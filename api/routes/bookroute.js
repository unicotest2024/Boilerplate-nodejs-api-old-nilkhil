const middleware = require("../middleware");

module.exports = function (server, restify) {

    // Add Book
    server.post('/books/add',

    middleware.verifyToken,        // first check token
    middleware.isAdmin,            // check admin only

    (req, res, next) => {

        //VALIDATION HERE
        const rules = {
            title: "required",
            author: "required",
            price: "required|numeric",
            stock: "required|numeric",
            category_id: "required|numeric"
        };

        const validation = validateRule(req.body, rules);

        if (!validation.status) {
            return res.send({
                "status": "error",
                "errors": validation.errors,
                "msg": "Input Validation Failed"
            });
        }

        //Pass only after validation succeeds
        BOOKCONTROLLER.addBook(req.body, function (response) {
            const status = response.status ? 200 : 401;
            res.send(status, response);
            next();
        });

    }
);


    server.get('/books/list',

        middleware.verifyToken,        // first check token

        (req, res, next) => {

            const rules = {
            page: "required|numeric",
            limit: "required|numeric",
          
        };

        const validation = validateRule(req.query, rules);

        if (!validation.status) {
            return res.send(400, {
                status: false,
                errors: validation.errors
            });
        }




            BOOKCONTROLLER.listBooks(req, function (response) {

                const status = response.status ? 200 : 401;

                res.send(status, response);
                next();
            });

        });

    server.get(
        '/books/:id',
        middleware.verifyToken,        // first check token
        (req, res, next) => {

            BOOKCONTROLLER.getBook(req, function (response) {

                const status = response.status ? 200 : 401;

                console.log({response});

                console.log({status});
                
                

                res.send(status, response);
                next();
            })
        }  //then go to controller
    );

    //api/books/:id | PUT | Update book info | Admin |

    server.put('/books/:id',
        middleware.verifyToken,
        middleware.isAdmin,

        (req, res, next ) =>{

            const rules = {
            title: "required",
            author: "required",
            price: "required|numeric",
            stock: "required|numeric"
        };

        const validation = validateRule(req.body, rules);

        if (!validation.status) {
            return res.send(400, {
                status: false,
                errors: validation.errors
            });
        }

        req.body.id = req.params.id;
        
        req.body.updated_by = req.user.id;   

        console.log(req.body);
        

            BOOKCONTROLLER.updateBookById(req, function (reponse){
                
                const status = reponse.status ? 200 : 401;

                res.send(status,reponse)

                next()
            })
        }


    )

};





