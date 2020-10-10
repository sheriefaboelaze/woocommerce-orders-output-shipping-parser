const http = require('http');
const fs = require('fs');
const csv = require('csv-parser')
const hostname = '127.0.0.1';
const port = 3000;
var export_csv = require('export-csv')


const  ExportToCsv = require('export-to-csv');

const server = http.createServer((req, res) => {

  console.log("helloooooo")
  //

  const resultsWithDonations = [];
  let results = [];
  let finalCsv = [];

  fs.createReadStream('./woocommerce-order-export.csv')
    .pipe(csv())
    .on('data', (data) => resultsWithDonations.push(data))
    .on('end', () => {
      console.log(`total orders: ${resultsWithDonations.length}`);
      console.log(resultsWithDonations)
      let numberCanceled, numberRefunded, numberProcessing;
      let numberOfDontations = 0;
      for(let i = 0; i < resultsWithDonations.length; i++) {
        if(!resultsWithDonations[i].line_item_1.includes("Face The Future"))
          results.push(resultsWithDonations[i])
      }
      console.log(`number of donations is: ${numberOfDontations}`)
      console.log(`number of non donations is: ${results.length}`)
      let ordersProcessing = [];
      let ordersRefunded = [];
      let ordersCancelled = [];
      let ordersFailed = [];
      let remainingOrders = [];
      for(let i = 0; i < results.length; i++) {
        if(results[i].status.includes("processing")){
          ordersProcessing.push(results[i])
        } else if(results[i].status.includes("refunded")) {
          ordersRefunded.push(results[i])
        } else if(results[i].status.includes("cancel")){
          ordersCancelled.push(results[i])
        } else if(results[i].status.includes("fail")) {
          ordersFailed.push(results[i])
        } else {
          remainingOrders.push(results[i])
        }
      }
      console.log(`numbers: ordersProcessing: ${ordersProcessing.length}, ordersRefunded: ${ordersRefunded.length}, ordersCancelled: ${ordersCancelled.length}, ordersFailed: ${ordersFailed.length} rest: ${remainingOrders.length}`)
      //get wuantity from each order
      let item_list
      let itemsPiped = [];
      let quantity;
      finalCsv.push({
        'name': 'name',
        'order number': 'order number',
        'shipping address': 'shipping address',
        'billing address': 'billing address',
        'quantity': 'quantity',
        'order total': 'order total',
      })
      for(let i = 0; i < ordersProcessing.length; i++) {
        item_list = ordersProcessing[i].line_item_1;
        itemsPiped = item_list.split("|");
      //  console.log(itemsPiped);
        quantity = itemsPiped[3].split(":")[1];
        if(!itemsPiped[3].split(":").includes("quantity"))
          console.log("Error: did not get quantity!");
        let orderNumber = ordersProcessing[i].order_number;
        let shippingAddress;
        let billingAddress;
        let name;
        if(ordersProcessing[i].billing_address_2.length > 1){
          billingAddress = `${ordersProcessing[i].billing_address_1}, ${ordersProcessing[i].billing_address_2}, ${ordersProcessing[i].billing_city}, ${ordersProcessing[i].billing_state}, ${ordersProcessing[i].billing_country}, ${ordersProcessing[i].billing_postcode}`;
        } else {
          billingAddress = `${ordersProcessing[i].billing_address_1}, ${ordersProcessing[i].billing_city}, ${ordersProcessing[i].billing_state}, ${ordersProcessing[i].billing_country}, ${ordersProcessing[i].billing_postcode}`;
        }
        if(ordersProcessing[i].shipping_address_1.length > 0){
          //use shipping address
          if(ordersProcessing[i].shipping_address_2.length > 1){
            shippingAddress = `${ordersProcessing[i].shipping_address_1}, ${ordersProcessing[i].shipping_address_2}, ${ordersProcessing[i].shipping_city}, ${ordersProcessing[i].shipping_state}, ${ordersProcessing[i].shipping_country}, ${ordersProcessing[i].shipping_postcode}`;
          } else {
            shippingAddress = `${ordersProcessing[i].shipping_address_1}, ${ordersProcessing[i].shipping_city}, ${ordersProcessing[i].shipping_state}, ${ordersProcessing[i].shipping_country}, ${ordersProcessing[i].shipping_postcode}`;
          }
        } else {
          shippingAddress = billingAddress;
          //no shipping address use billing address
        }
        if(ordersProcessing[i].shipping_first_name.length > 0){
          name = `${ordersProcessing[i].shipping_first_name} ${ordersProcessing[i].shipping_last_name}`
        } else {
          name = `${ordersProcessing[i].billing_first_name} ${ordersProcessing[i].billing_last_name}`
        }
        let orderTotal = ordersProcessing[i].order_total;
        finalCsv.push({
          'name': name,
          'order number': orderNumber,
          'shipping address': shippingAddress,
          'billing address': billingAddress,
          'quantity': quantity,
          'order total': orderTotal,
        })
      }
      export_csv(finalCsv, './orders_shipping_info2.csv');
      //console.log(finalCsv);
    //  const csvExporter = ExportToCsv.ExportToCsv(finalCsv);
//     const options = {
//   fieldSeparator: ',',
//   quoteStrings: '"',
//   decimalSeparator: '.',
//   showLabels: true,
//   showTitle: true,
//   title: 'My Awesome CSV',
//   useTextFile: false,
//   useBom: true,
//   useKeysAsHeaders: true,
//   // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
// };
//
// const csvExporter = new ExportToCsv(options);
//
// csvExporter.generateCsv(finalCsv);


    });





//   fs.readFile('C:/Users/sheri/Documents/work/Patty and the Pandemic/woocommerce-order-export.csv', 'utf8', function read(err, data) {
//       if (err) {
//           throw err;
//       }
//       //content = data;
//
// let temp = data.csv()
//
//       let dataArray = data.split('\n')
//       console.log(`the length of the array is ${dataArray.length}`)
//       console.log(`first element: ${dataArray[0]}`)
//       console.log(`last element: ${dataArray[dataArray.length-2]}`)
//       let count = 0;
//       let idArray = [];
//       console.log(`first row: ${dataArray}`)
//       for(let i = 0; i < dataArray.length; i++) {
//         if(dataArray[i].length < 2) {
//           count++;
//           //console.log(`the index is: ${i}`)
//           //console.log(`element is: ${dataArray[i]}`)
//         }
//         idArray.push(dataArray[i].split(',')[0])
//       //  console.log(`${idArray[i]}\n`)
//         //console.log(dataArray[i])
//       }
//       console.log(`the count is: ${count}`)
//       console.log(`all the id's are: ${idArray}`)
//
//     });

  // let data = fs.readFile('C:/Users/sheri/Documents/work/Patty and the Pandemic/woocommerce-order-export.csv', 'utf8');
  // console.log(data)


  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
