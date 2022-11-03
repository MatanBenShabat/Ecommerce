const Product = require("../models/productsModel");

class AuctionTimersClass {
  constructor() {
    this.timers = new Map();
    this.io = null;
  }

  async fetchProducts() {
    const products = await Product.find({}).select("_id endOfAuctionDate");

    // product:{_id:ObjectId(), endOfAuctionDate:Date}
    products.map((product) => {
      this.createTimer(product);
    });
  }

  createTimer(product) {
    const delay = this.calculateDelay(product.endOfAuctionDate);
    const timer = setTimeout(() => {
      this.emitTimerEnded(product._id.valueOf());
    }, delay);

    this.timers.set(product._id.valueOf(), timer);
  }

  calculateDelay(date) {
    const time = Date.parse(date) - Date.now();
    return time;
    // return 10 * 1000;
  }

  cancleTimer(id) {
    clearTimeout(this.timers.get(id.valueOf()));
    this.timers.delete(id.valueOf());
  }

  addProduct(product) {
    this.createTimer(product);
  }

  async emitTimerEnded(id) {
    await Product.findByIdAndUpdate(id, { isActive: false });
    this.io.sockets.emit("product_added");
    this.cancleTimer(id);
  }
}

const AuctionTimers = new AuctionTimersClass();

module.exports = AuctionTimers;
