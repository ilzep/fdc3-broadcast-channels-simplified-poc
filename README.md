# fdc3-broadcast-channels-simplified-poc
 Simpler version of FDC3 broadcast POC

# Getting started

## Setup
Install required npm packages
```
npm install
```

# Start applications
To start the sender and receiver applications

```
npm run start:sender

npm run start:receiver


npm run fin:sender

npm run fin:receiver
```

# Notes

To test communication between the two apps, click on the 'Broadcast' button in the Sender screen. You should see messages arrving and appearing on the blue Receiver main window.

I am showing the provider window for the receive app. This usually would not be displayed to users. It is being shown, to allow checking the interop broker logs in dev tools.