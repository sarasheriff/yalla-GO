import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UsersService } from '../users.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpServiceService } from '../http-service.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  error = null;
  email;
  password;
  myForm: FormGroup;
  users;
  owners;

  errorcheck = false;
  loggedinheader = false;
  ownerloggedinheader = false;
  @ViewChild("logginOwner", { static: true }) logginOwnerChecker: ElementRef;

  constructor(private userservice: UsersService, private fb: FormBuilder, private serviceServer: HttpServiceService, private router: Router) {
    this.userservice.gettingUsers().subscribe((data) => {
      this.users = data;

    }, error => {
      this.error = error.message;
      console.log(error)
      console.log(error.status)
      this.router.navigate(["/error"])
    })
    this.serviceServer.getownerdata().subscribe((data) => {
      this.owners = data;
    }, error => {
      this.error = error.message;
      console.log(error)
      console.log(error.status)
      this.router.navigate(["/error"])
    })
  }

  ngOnInit() {
    this.myForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-z]\w{1,}@[a-z]{1,}.com$/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{5,}$/)]],
    });
  }

  onSubmit(form: FormGroup) {

    this.email = this.myForm.controls.email.value;
    this.password = this.myForm.controls.password.value;
    if (this.logginOwnerChecker.nativeElement.checked == false) {
      for (let i of this.users) {
        if (i.email == this.email && i.password == this.password) {
          this.errorcheck = false;
          this.serviceServer.setData("user", i)
          this.serviceServer.setData("loggedin", true)
          this.loggedinheader = true
          this.serviceServer.displayProfileIcon(this.loggedinheader)
          this.router.navigate(["/"]);
          return i;
        }
      }
      this.errorcheck = true;
    }
    else {
      for (let i of this.owners) {
        if (i.email == this.email && i.password == this.password) {
          this.errorcheck = false;
          this.serviceServer.setData("owneruser", i)
          this.serviceServer.setData("ownerloggedin", true)
          this.ownerloggedinheader = true
          this.serviceServer.displayProfileIconToOwner(this.ownerloggedinheader)
          this.router.navigate(["/ownerProfile"]);
          return i;
        }
      }
      this.errorcheck = true;
    }
  }


}


