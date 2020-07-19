var mongoose =  require('mongoose');

mongoose.connect('mongodb://localhost:27017/Mindpeers');


mongoose.connection.on('connected', ()=> {
    console.log('Connection Open');
})
mongoose.connection.on('error', (err)=> {
    console.log(`Connection error ${err}`);
})
mongoose.connection.on('disconnected', ()=> {
    console.log('Connection closed');
})

mongoose.connection.once("open", function() {
    console.log("MongoDB connected successfully");
    mongoose.connection.db.listCollections().toArray(function(err, names) {
        if (err) {
            console.log(err);
        } else {
            let flag = false;
            for (i = 0; i < names.length; i++) {
                if ((names[i].name = "doctor")) {
                    flag == true;
                   
                }
            }
            if(!flag) {
                mongoose.connection.db.createCollection(
                    "doctor",
                    function(err, result) {
                        console.log("Collection created: doctor");
                    }
                );
            }
        } 
    });
});
