import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { HttpServiceService } from '../http-service.service';
import { Router } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { mapToMapExpression } from '@angular/compiler/src/render3/util';
import { MapsAPILoader, MouseEvent, GoogleMapsScriptProtocol } from '@agm/core';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {
  // ...................google map 2 ............//
  title: string = 'AGM project';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  geoCoder: any;
  @ViewChild('search', { static: false }) public searchElementRef: ElementRef;
  // ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,...../
  error = null;
  histroy;
  ownerHistory = [];
  places;
  owenerplace;
  owner;
  idPlace;
  options;
  ownerOptions = [];
  optionCheck = false;
  OptionValid = true;
  fileData: File;
  fileDataOption: File;
  OptionName: any = "";
  optionDesc: any = "";
  optionPrice: any = "";
  imageSrc = "../../assets/Home/defaultPlace.png";
  imgs = ["../../assets/Home/defaultPlace.png"];
  editedOptionImg = "../../assets/Home/defaultPlace.png";
  imgsEditedOption = ["../../assets/Home/defaultPlace.png"];
  pageOfItems;

  // .........................///
  arrOfCats = [];
  id;
  editArr: any = [];
  // ..................notfications....///
  alertArr = [];
  reverseAlertArr = [];
  // ...........................///
  fileData2;
  imageSrc2 = "../../assets/Home/defaultPlace.png";
  imgs2 = ["../../assets/Home/defaultPlace.png", "../../assets/Home/defaultPlace.png", "../../assets/Home/defaultPlace.png"]
  filedDataGerenal = [];
  imgs2before = [...this.imgs2];
  addExtra = false;
  statusOwner;
  reservationOwner;
  kidsOwner;
  statusOwnerText;
  reservationOwnerText;
  kidsOwnerText;
  placename = "";
  placecontact = "";
  placeaddres = "";
  placelocation = "";
  checkbox = false; //checking if he is an owner
  chechDiv = false;
  placeDesc: any = "";
  openStart: any = "";
  openEnd: any = "";
  cats;
  celectedArr = [];
  facebook = "facebook Page"
  instgrame = "instgrame Page"
  facebookBeforeConfirmation = this.facebook;
  instgrameBeforaConfirmation = this.instgrame;

  constructor(private httpService: HttpServiceService, private router: Router, private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone) {

    // .....................getting owner place from data base................///
    this.celectedArr = [1]
    this.owner = this.httpService.getData("owneruser");
    this.httpService.gettingPlaces().subscribe(data => {
      this.places = data;
      for (let place of this.places) {

        if (place.ownerId == this.owner.id) {
          this.owenerplace = place;
          this.statusOwner = this.owenerplace.status;
          this.statusOwnerText = this.owenerplace.status;
          this.reservationOwner = this.owenerplace.reservation;
          this.reservationOwnerText = this.owenerplace.reservation;
          this.kidsOwner = this.owenerplace["kid-friendly"];
          this.kidsOwnerText = this.owenerplace["kid-friendly"];

          this.placename = this.owenerplace.name;
          this.placecontact = this.owenerplace.contact.phone;
          this.placeaddres = this.owenerplace.address;
          this.placelocation = this.owenerplace.location;
          this.placeDesc = this.owenerplace.desc;
          this.openStart = this.owenerplace.openHours;
          this.openEnd = this.owenerplace.openHours;
          // .............map Google......////
          this.mapsAPILoader.load().then(() => {
            this.setCurrentLocation();

          });

          break;
        }
      }

      // .............getting categories from data base to be showen in edit place form .............///
      this.httpService.gettingData().subscribe(data => {
        this.cats = data;
        for (let i of this.cats) {
          setTimeout(() => {
            this.id = document.getElementById(i.id);
            this.arrOfCats.push(this.id)

          }, 10)

        }

      })

      // ...............getting reservation histroy from data base .............///
      this.httpService.getHistroy().subscribe(data => {
        this.histroy = data;
        this.ownerHistory = []
        for (let i of this.histroy) {
          if (i.reservedGame[0].placeId == this.owenerplace.id) {
            this.ownerHistory.push(i);
          }
        }
        this.alertArr = []
        for (let i of this.ownerHistory) {
          if (i.state == false) {
            this.alertArr.push(i);
          }

        }
        // .............handling notifications of reservations ...........//
        this.reverseAlertArr = this.ownerHistory.reverse();
        this.httpService.getNotifivations(this.alertArr.length)
      })

      this.httpService.gettingPtions().subscribe(data => {
        this.options = data;
        this.ownerOptions = [];
        for (let i of this.options) {
          this.editArr.push(false);
          if (i.placeId == this.owenerplace.id) {
            this.ownerOptions.push(i);
          }
        }

      })
    }, error => {
      this.error = error.message;
      console.log(error)
      console.log(error.status)
      this.router.navigate(["/error"])
    })
  }

  ngOnInit() {
    // .................................................///
    // an example array of 150 items to be paged
    this.reverseAlertArr = Array(150).fill(0).map((x, i) => ({ id: (i + 1), name: `Item ${i + 1}` }));
  }

  // ..........................google map ............///
  // Get Current Location Coordinates
  private setCurrentLocation() {
    if (this.owenerplace.lat) {
      this.latitude = this.owenerplace.lat;
      this.longitude = this.owenerplace.long;
      this.zoom = 15;
    }
    else {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.zoom = 15;

        });
      }

    }
  }


  markerDragEnd($event: MouseEvent) {
    console.log($event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;

  }
  showmap = false;
  showingMap() {
    this.showmap = true;
  }
  savingLocationMap() {
    let headers = { "Conetent-Type": "application/json" }
    this.owenerplace.lat = this.latitude;
    this.owenerplace.long = this.longitude;
    this.httpService.PutPlaces(this.owenerplace.id, this.owenerplace, headers).subscribe(data => {
      console.log(this.owenerplace)
      console.log(data);
      this.showmap = false;
    })

  }
  cancelingMap() {
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();

    });
  }



  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }

  // .....................uploading image for edit place form............................///
  readURL(event: any) {
    this.fileData = <File>event.target.files[0];
    this.preview();
  }
  preview() {
    var mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    let reader;
    reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = _event => {
      this.imageSrc = reader.result;
      this.verfyingOption(this.OptionName, this.optionDesc, this.optionPrice, false)

    }
  }



  // editedOptionImg.....................//
  readURLOption(event: any) {
    this.fileDataOption = <File>event.target.files[0];
    this.previewOption();
    this.allowAddEdit = true
  }
  previewOption() {
    var mimeType = this.fileDataOption.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    let reader;
    reader = new FileReader();
    reader.readAsDataURL(this.fileDataOption);
    reader.onload = _event => {
      this.editedOptionImg = reader.result;
      this.verfyingOption(this.OptionName, this.optionDesc, this.optionPrice, false)

    }
  }



  // ................edit option verfying form ................///
  verfyingOption(OptionName, optionDesc, optionPrice, state = true) {
    if (state == true) {
      this.OptionName = OptionName.value;
      this.optionDesc = optionDesc.value;
      this.optionPrice = optionPrice.value;
    }
    if (this.OptionName.length > 0 && this.optionDesc.length > 0 && this.optionPrice.length > 0) {
      this.OptionValid = false;
    }
    else {
      this.OptionValid = true;
    }

  }

  // ...........new option added to data base ......................///
  submitiingNewOption() {
    this.optionCheck = false;
    let optionObj;
    let headers = { "Conetent-Type": "application/json" }
    optionObj = {
      "name": this.OptionName,
      "imgs": this.imgs,
      "desc": this.optionDesc,
      "price": this.optionPrice,
      "placeId": this.owenerplace.id,
      "img": this.imageSrc
    }

    this.imageSrc = "../../assets/Home/defaultPlace.png";
    this.imgs = ["../../assets/Home/defaultPlace.png"];


    this.httpService.postOptions(optionObj, headers).subscribe(data => {
      this.httpService.gettingPtions().subscribe(data => {
        this.options = data;
        this.ownerOptions = [];
        for (let i of this.options) {
          if (i.placeId == this.owenerplace.id) {
            this.ownerOptions.push(i);
          }
        }

      })
    })



  }
  // .............adding and deleting options ..............///
  addOption() {
    this.optionCheck = true;
  }

  deletinOption(id) {
    this.httpService.deleteOption(id).subscribe(data => {
      this.httpService.gettingPtions().subscribe(data => {
        this.options = data;
        this.ownerOptions = [];
        for (let i of this.options) {
          if (i.placeId == this.owenerplace.id) {
            this.ownerOptions.push(i);
          }
        }

      })
    }, error => {
      this.error = error.message;
      console.log(error)
      this.router.navigate(["/error"])
    })
  }


  // ..............  edit place details....................///



  // info adding
  readURLGeneral(event: any, i) {
    this.filedDataGerenal[i] = <File>event.target.files[0];
    this.previewGerneral(i);
  }
  previewGerneral(i) {
    var mimeType = this.filedDataGerenal[i].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    let reader;
    reader = new FileReader();
    reader.readAsDataURL(this.filedDataGerenal[i]);
    reader.onload = _event => {
      this.imgs2before[i] = reader.result;
      this.verfyingPlcae(this.placename, this.placelocation, this.placecontact, this.placeaddres, this.placeDesc, this.openStart, this.openEnd, false)
    }
  }

  askIfaddingExtraInfo(checking) {
    console.log(checking.checked)
    if (checking.checked == true) {
      this.addExtra = true
    }
    else { this.addExtra = false }
  }

  addingExtraInfoConfirm = false;
  addingExtraInfo(facebook, instgrame, checking) {
    this.facebookBeforeConfirmation = facebook.value;
    this.instgrameBeforaConfirmation = instgrame.value;
    this.addExtra = false;
    checking.checked = false
    this.addingExtraInfoConfirm = true;
  }




  readURL2(event: any) {
    this.fileData2 = <File>event.target.files[0];
    this.preview2();
  }
  preview2() {
    var mimeType = this.fileData2.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    let reader;
    reader = new FileReader();
    reader.readAsDataURL(this.fileData2);
    reader.onload = _event => {
      this.imageSrc2 = reader.result;

      this.verfyingPlcae(this.placename, this.placelocation, this.placecontact, this.placeaddres, this.placeDesc, this.openStart, this.openEnd, false)
    }
  }

  gettingStatus(val) {
    this.statusOwner = val.srcElement.attributes.value.value;
    this.statusOwnerText = val.target.text;
    this.verfyingPlcae(this.placename, this.placelocation, this.placecontact, this.placeaddres, this.placeDesc, this.openStart, this.openEnd, false)
  }


  gettingReservation(val) {
    this.reservationOwner = val.srcElement.attributes.value.value;
    this.reservationOwnerText = val.target.text;
    this.verfyingPlcae(this.placename, this.placelocation, this.placecontact, this.placeaddres, this.placeDesc, this.openStart, this.openEnd, false)

  }
  gettingKidsArea(val) {
    this.kidsOwner = val.srcElement.attributes.value.value;
    this.kidsOwnerText = val.target.text;
    this.verfyingPlcae(this.placename, this.placelocation, this.placecontact, this.placeaddres, this.placeDesc, this.openStart, this.openEnd, false)
  }


  selectingCats() {
    this.celectedArr = [];
    for (let i of this.arrOfCats) {
      if (i.checked == true) {
        this.celectedArr.push(i.id)
      }
    }
    console.log(this.celectedArr)
    this.verfyingPlcae(this.placename, this.placelocation, this.placecontact, this.placeaddres, this.placeDesc, this.openStart, this.openEnd, false)
  }

  verfyingPlcae(placeNName, contact, address, location, desc, openHoursEnd, openHoursStart, state = true) {
    if (state == true) {
      this.placename = placeNName.value;
      this.placelocation = location.value;
      this.placecontact = contact.value;
      this.placeaddres = address.value;
      this.placeDesc = desc.value;
      this.openStart = openHoursStart.value;
      this.openEnd = openHoursEnd.value;
    }

    if (this.placename.length > 0 && this.placelocation.length > 0
      && this.placecontact.length > 7 && +this.placecontact / 1 == +this.placecontact && this.placeaddres.length > 0 && this.placeDesc.length > 0
      && this.openStart.length > 0 && this.celectedArr.length != 0 && this.celectedArr.length <= 3 && this.openEnd
      && this.statusOwner && this.reservationOwner && this.kidsOwner) {

      this.chechDiv = true;
    }
    else {
      this.chechDiv = false;


    }

  }
  placeObj;
  // ........................add to data base the new edited place...................//

  addPlaceToThisOwner() {
    if (this.addingExtraInfoConfirm == true) {

      this.facebook = this.facebookBeforeConfirmation;
      this.instgrame = this.instgrameBeforaConfirmation;
      this.imgs2 = [...this.imgs2before];
      this.addingExtraInfoConfirm = false;
    }

    let headers = { "Conetent-Type": "application/json" }

    let oldimg = this.owenerplace.mainImage;
    let oldimgs = this.owenerplace.imgs;
    if (this.imageSrc2 == "../../assets/Home/defaultPlace.png") {
      this.imageSrc2 = oldimg;
    }
    let test = ["../../assets/Home/defaultPlace.png", "../../assets/Home/defaultPlace.png", "../../assets/Home/defaultPlace.png"]
    console.log(this.imgs2)


    if (this.imgs2[0] == test[0] && this.imgs2[1] == test[1] && this.imgs2[2] == test[2]) {
      this.imgs2 = oldimgs;
    }
    this.placeObj = {
      "name": this.placename,
      "catId": this.celectedArr,
      "address": this.placeaddres,
      "location": this.placelocation,
      "rates": [1, 2, 3, 4, 5],
      "paymentMethod": "Ticket",
      "avgrate": 5,
      "mainImage": this.imageSrc2,
      "imgs": this.imgs2,
      "status": this.statusOwner,
      "openHours": this.openStart + " to " + this.openEnd,
      "desc": this.placeDesc,
      "reservation": this.reservationOwner,
      "kid-friendly": this.kidsOwner,
      "contact": {
        "phone": this.placecontact,
        "facebook": this.facebook,
        "instagram": this.instgrame
      },
      "ownerId": this.owner.id
    }

    this.idPlace = this.owenerplace.id;
    this.httpService.PutPlaces(this.idPlace, this.placeObj, headers).subscribe(data => {

      this.imageSrc2 = "../../assets/Home/defaultPlace.png";
      this.imgs2 = ["../../assets/Home/defaultPlace.png", "../../assets/Home/defaultPlace.png", "../../assets/Home/defaultPlace.png"]
      this.router.navigate(["/place", this.idPlace])
    }, error => {
      this.error = error.message;
      console.log(error)
      console.log(error.status)
      this.router.navigate(["/error"])
    })

  }
  canseliing() {
    this.optionCheck = false;
  }


  ///edit option
  allowAddEdit = false;

  editOption(ii, id) {
    this.editArr[ii] = true;
  }

  canselingEditOption(ii) {
    this.editArr[ii] = false
  }
  checkingAllowAddEdited(id) {
    let input;
    input = Array.from(document.getElementsByClassName(id))
    if (input[0].value.length > 0 && input[1].value.length > 0 && input[2].value.length > 0) {
      this.allowAddEdit = true;
    }
    else {
      this.allowAddEdit = false;
    }
  }
  addingEdtedOption(i, ii, id) {
    let input;
    input = Array.from(document.getElementsByClassName(id))
    this.editArr[ii] = false;

    //making new object to be edited 
    let headers = { "Conetent-Type": "application/json" }
    let oldimg = i.img;
    if (this.editedOptionImg == "../../assets/Home/defaultPlace.png") {
      this.editedOptionImg = oldimg
    }
    let obj;
    obj = {
      "id": i.id,
      "name": input[0].value,
      "imgs": this.imgsEditedOption,
      "desc": input[2].value,
      "longDesc": "You are locked up in a strange room  Explore the room, find hidden items and solve riddles.Then you will be able to escape from the room.Let's escape!",
      "price": input[1].value,
      "placeId": this.owenerplace.id,
      "img": this.editedOptionImg
    }

    this.editedOptionImg = "../../assets/Home/defaultPlace.png";
    this.imgsEditedOption = ["../../assets/Home/defaultPlace.png"];

    this.httpService.PutOptions(id, obj, headers).subscribe(data => {

      this.httpService.gettingPtions().subscribe(data => {
        this.options = data;
        this.ownerOptions = [];
        for (let i of this.options) {
          if (i.placeId == this.owenerplace.id) {
            this.ownerOptions.push(i);
          }
        }

      })

    }, error => {
      this.error = error.message;
      console.log(error)
      console.log(error.status)
      this.router.navigate(["/error"])
    })



  }

  // ................................notifations functionss..........//
  removingFalse(i, id) {
    i.state = true;
    let headers = { "Conetent-Type": "application/json" }

    this.httpService.PutHistory(id, i, headers).subscribe(data => {


      this.httpService.getHistroy().subscribe(data => {
        this.histroy = data;
        this.ownerHistory = []
        for (let i of this.histroy) {
          if (i.reservedGame[0].placeId == this.owenerplace.id) {
            this.ownerHistory.push(i);
          }
        }
        this.alertArr = []
        for (let i of this.ownerHistory) {
          if (i.state == false) {
            this.alertArr.push(i);
          }

        }
        this.reverseAlertArr = this.ownerHistory.reverse();
        this.httpService.getNotifivations(this.alertArr.length)
      })

    }, error => {
      this.error = error.message;
      console.log(error)
      console.log(error.status)
      this.router.navigate(["/error"])
    })


  }

  deletingHistory(id) {
    this.httpService.deleteHistory(id).subscribe(data => {
      console.log(data)

      // .......test..........///
      this.httpService.getHistroy().subscribe(data => {
        this.histroy = data;
        this.ownerHistory = []
        for (let i of this.histroy) {
          if (i.reservedGame[0].placeId == this.owenerplace.id) {
            this.ownerHistory.push(i);
          }
        }
        this.alertArr = []
        for (let i of this.ownerHistory) {
          if (i.state == false) {
            this.alertArr.push(i);
          }

        }
        this.reverseAlertArr = this.ownerHistory.reverse();
        this.httpService.getNotifivations(this.alertArr.length)
      })
      // ....................///

    }, error => {
      this.error = error.message;
      console.log(error)
      console.log(error.status)
      this.router.navigate(["/error"])
    })
  }
  // .......................///
}
