const bcrypt = require('bcrypt');


const authorize = (req,result) => {
  let {typedPassword} = req.body
  typedPassword = bcrypt.hash(typedPassword, 10)
  return bcrypt.compare(result.password, typedPassword)
}

module.exports =  authorize