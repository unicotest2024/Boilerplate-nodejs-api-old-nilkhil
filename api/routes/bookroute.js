

module.exports = function (server, restify) {

    // Add Book
    server.post('/books/add',

    global.middleware.verifyToken,        // first check token
    global.middleware.isAdmin,            // check admin only

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
           
            res.send({"status": "success",
            "msg": "Book added",
            "data": response});
            next();
        });

    }
);


    server.get('/books/list',

        global.middleware.verifyToken,        // first check token

        (req, res, next) => {

            const rules = {
            page: "required|numeric",
            limit: "required|numeric",
          
        };

        const validation = validateRule(req.query, rules);

        if (!validation.status) {
            return res.send( {
                "status": "error",
                "errors": validation.errors,
                "msg": "Input Validation Failed"
            });
        }




            BOOKCONTROLLER.listBooks(req, function (response) {


                res.send({
                    "status":"success",
                    "msg":"list of book",
                    "data":response
                });
                next();
            });

        });

    server.get(
        '/books/:id',
        global.middleware.verifyToken,        // first check token
        (req, res, next) => {

            const bookId = req.params.id

            BOOKCONTROLLER.getBook(bookId, function (response) {

                res.send({
                    "status":"success",
                    "msg":"Book fetched successfully",
                    "data":response
                });
                next();
            })
        }  //then go to controller
    );

    //api/books/:id | PUT | Update book info | Admin |

    server.put('/books/:id',
        global.middleware.verifyToken,
        global.middleware.isAdmin,

        (req, res, next ) =>{

            const rules = {
            title: "required",
            author: "required",
            price: "required|numeric",
            stock: "required|numeric"
        };

        const validation = validateRule(req.body, rules);

        if (!validation.status) {
            return res.send({
                "status": "error",
                "errors": validation.errors,
                "msg": "Input Validation Failed"
            });
        }

        req.body.id = req.params.id;
        
        req.body.updated_by = req.user.id;   

        //console.log(req.body);
        

            BOOKCONTROLLER.updateBookById(req, function (reponse){
                
                 

                res.send({
                    "status":"success",
                    "msg":"Book updated successfully",
                    "data":reponse
                })

                next()
            })
        }


    )

};





