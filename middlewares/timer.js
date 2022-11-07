// const { set } = require("mongoose");
// const Products = require("../models/productsModel");

// const timer =  (req, next) => {
//   const username = req.body.seller;
//   const update = { isActive: false };
//   const filter = { seller: username };
//   console.log(update);
//   const endAuction = (filterParam, updateParam) => {
//      Products.findOneAndUpdate(filterParam, updateParam, {
//       new: true,
//       runValidators: true,
//     });
//     console.log("succeed");
//     // io.on("connection", (socket) => {
//     //   socket.broadcast.emit("product_added");
//     // });
//     // res.status(200).json({
//     //   status: "success",
//     //   message: "Autcion has ended",
//     // });
//   };
//   // const createTimer = (func) => {
//   //   const auctionTime = 8000;
//   //   setTimeout(func, 1000000);
//   // };
//   // setTimeout(() => {
//   //   endAuction(filter, update);
//   // }, "8000")
//   endAuction(filter, update)
//   next();
// };

// module.exports = timer

