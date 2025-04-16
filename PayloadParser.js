//test:68 6B 74 00 07 07 00 78 00 96 00 00 00 C8 00 00 00 C8



function parseUplink(device, payload) {

    var payloadb = payload.asBytes();
    var decoded = Decoder(payloadb, payload.port)
    env.log(decoded);

    // Store Counter A
    if (decoded.counterA != null) {
        var sensor1 = device.endpoints.byAddress("1");

        if (sensor1 != null)
            sensor1.updatePeopleCounterStatus(decoded.counterA);
    };

   // Store Counter B
    if (decoded.counterB != null) {
        var sensor2 = device.endpoints.byAddress("2");

        if (sensor2 != null)
            sensor2.updatePeopleCounterStatus(decoded.counterB);
    };
  // Store Total Counter A
    if (decoded.totalCounterA != null) {
        var sensor3 = device.endpoints.byAddress("3");

        if (sensor3 != null)
            sensor3.updatePeopleCounterStatus(decoded.totalCounterA);
    };
// Store Total Counter B
    if (decoded.totalCounterB != null) {
        var sensor4 = device.endpoints.byAddress("4");

        if (sensor4 != null)
            sensor4.updatePeopleCounterStatus(decoded.totalCounterB);
    };



    // Store Battery
    if (decoded.battery != null) {
        var sensor4 = device.endpoints.byAddress("5");

        if (sensor4 != null)
            sensor4.updateGenericSensorStatus(decoded.battery);
             device.updateDeviceBattery({ percentage : decoded.battery });
    };
   
    
}
function buildDownlink(device, endpoint, command, payload) 
{ 
	// This function allows you to convert a command from the platform 
	// into a payload to be sent to the device.
	// Learn more at https://wiki.cloud.studio/page/200

	// The parameters in this function are:
	// - device: object representing the device to which the command will
	//   be sent. 
	// - endpoint: endpoint object representing the endpoint to which the 
	//   command will be sent. May be null if the command is to be sent to 
	//   the device, and not to an individual endpoint within the device.
	// - command: object containing the command that needs to be sent. More
	//   information at https://wiki.cloud.studio/page/1195.

	// This example is written assuming a device that contains a single endpoint, 
	// of type appliance, that can be turned on, off, and toggled. 
	// It is assumed that a single byte must be sent in the payload, 
	// which indicates the type of operation.

/*
	 payload.port = 25; 	 	 // This device receives commands on LoRaWAN port 25 
	 payload.buildResult = downlinkBuildResult.ok; 

	 switch (command.type) { 
	 	 case commandType.onOff: 
	 	 	 switch (command.onOff.type) { 
	 	 	 	 case onOffCommandType.turnOn: 
	 	 	 	 	 payload.setAsBytes([30]); 	 	 // Command ID 30 is "turn on" 
	 	 	 	 	 break; 
	 	 	 	 case onOffCommandType.turnOff: 
	 	 	 	 	 payload.setAsBytes([31]); 	 	 // Command ID 31 is "turn off" 
	 	 	 	 	 break; 
	 	 	 	 case onOffCommandType.toggle: 
	 	 	 	 	 payload.setAsBytes([32]); 	 	 // Command ID 32 is "toggle" 
	 	 	 	 	 break; 
	 	 	 	 default: 
	 	 	 	 	 payload.buildResult = downlinkBuildResult.unsupported; 
	 	 	 	 	 break; 
	 	 	 } 
	 	 	 break; 
	 	 default: 
	 	 	 payload.buildResult = downlinkBuildResult.unsupported; 
	 	 	 break; 
	 }
*/

}


function easy_decode(bytes) {
    var decoded = {};

    if (checkReportSync(bytes) == false)
        return;

    var dataLen = bytes.length - 5;
    var i = 5;
    while (dataLen--) {
        var type = bytes[i];
        i++;
        switch (type) {
            case 0x01:  //software_ver and hardware_ver
                decoded.hard_ver = bytes[i];
                decoded.soft_ver = bytes[i + 1];
                dataLen -= 2;
                i += 2;
                break;
            case 0x03:// battery
                decoded.battery = bytes[i];
                dataLen -= 1;
                i += 1;
                break;
            case 0x04:// IR report mode
                decoded.IRreportMode = bytes[i];
                dataLen -= 1;
                i += 1;
                break;
            case 0x05:// IR report intervel
                decoded.IRreportIntervel = byteToUint16(bytes.slice(i, i + 2));
                dataLen -= 2;
                i += 2;
                break;
            case 0x06:// Threshold of total number of users
                decoded.totalNumber = byteToUint16(bytes.slice(i, i + 2));
                dataLen -= 2;
                i += 2;
                break;
            case 0x07:// people counter report
                decoded.counterA = byteToUint16(bytes.slice(i, i + 2));
                decoded.counterB = byteToUint16(bytes.slice(i + 2, i + 4));
                decoded.totalCounterA = byteToUint32(bytes.slice(i + 4, i + 8));
                decoded.totalCounterB = byteToUint32(bytes.slice(i + 8, i + 12));
                dataLen -= 12;
                i += 12;
                break;
            case 0x83:// fault status
                decoded.faultStatus = bytes[i];
                dataLen -= 1;
                i += 1;
                break;
            case 0x86:// report interval
                decoded.reportInterval = byteToUint16(bytes.slice(i, i + 2));
                dataLen -= 2;
                i += 2;
                break;
        }
    }
    return decoded;
}


function byteToUint16(bytes) {
    var value = (bytes[0] << 8) | bytes[1];
    return value;
}

function byteToUint32(bytes) {
    var value = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | (bytes[3] << 0);
    return value;
}


function hexToString(bytes) {

    var value = "";
    var arr = bytes.toString(16).split(",");
    for (var i = 0; i < arr.length; i++) {
        value += parseInt(arr[i]).toString(16);
    }
    return value;
}

function checkReportSync(bytes) {
    if (bytes[0] == 0x68 && bytes[1] == 0x6B && bytes[2] == 0x74) {
        return true;
    }
    return false;
}

function Decoder(bytes, port) {
    return easy_decode(bytes);
}

