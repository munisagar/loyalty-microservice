const express = require('express');
const app = express();
const customerRoutes = require('./routes/customerRoutes');

app.use(express.json());

app.use('/api/customers', customerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Microservice running on port ${PORT}`);
});