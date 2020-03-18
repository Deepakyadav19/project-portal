import { SendHttpRequestService } from "./../send-http-request.service";
import {
  Component,
  OnInit,
  OnChanges,
  ViewChild,
  ElementRef
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { EmployeeService } from "../services/employee.service";
import swal from "sweetalert2";

import { jsonDecoder } from "../utils/json.util";

@Component({
  selector: "app-admindashboard",
  templateUrl: "./admindashboard.component.html",
  styleUrls: ["./admindashboard.component.scss", "../main/main.component.scss"]
})
export class AdmindashboardComponent implements OnInit {
  @ViewChild("myAlert", { static: false }) myAlert: ElementRef;
  deleteEmp: boolean = true;
  name = "Angular";
  page: number = 1;
  lastPage: number;
  items = [];
  dashboard: string = "Admin Dashboard";
  menus: any = [
    {
      title: "Employees",
      icon: "fa fa-users",
      active: false,
      type: "dropdown",

      submenus: [
        {
          title: "Add New Employee",
          route: "/employee/create"
        }
      ]
    },
    {
      title: "Projects",
      icon: "fa fa-book",
      active: false,
      type: "dropdown",

      submenus: [
        {
          title: "Add New Project",
          route: "/project/create"
        },
        {
          title: "Show All Projects",
          route: "/project"
        }
      ]
    },
    {
      title: "Timesheets",
      icon: "fa fa-calendar",
      active: false,
      type: "dropdown",

      submenus: [
        {
          title: "Show All Timesheets",
          route: "/timesheetweek"
        }
      ]
    }
  ];

  message: String;

  constructor(private employeeService: EmployeeService) {}
  usersArray: any;
  user: any;

  limit: number = 5;
  dataSize: number;

  empObjId: string;

  isSortDecreasing: boolean = false;

  columns: any = {};

  sortAccordingTo: any = { name: (this.isSortDecreasing? 1 : -1) };

  tabularData(criteria: any = {}) {
    this.employeeService
      .showAllEmployees({
        page: this.page.toString(),
        limit: this.limit.toString(),
        criteria: JSON.stringify(criteria),
        columns: JSON.stringify(this.columns),
        sort: JSON.stringify(this.sortAccordingTo)
      })
      .subscribe(res => {
        this.usersArray = res.payload.data.result.results;
        this.dataSize = res.payload.data.result.dataSize;
      });
    this.lastPage = this.dataSize / 5 + 1;
  }

  ngOnInit() {
    this.tabularData();

    this.empObjId = jsonDecoder().empId;
  }

  deleteEmployee(empId: string) {
    const swalWithBootstrapButtons = swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true
      })
      .then(result => {
        if (result.value) {
          this.employeeService.deleteEmployee(empId).subscribe(res => {
            this.tabularData();
            this.message = res.payload.message;
            setTimeout(() => {
              this.message = null;
            }, 5000);
            this.usersArray = this.usersArray.filter(
              item => item.empId != empId
            );
          });
          swalWithBootstrapButtons.fire(
            "Deleted!",
            "employee has been deleted.",
            "success"
          );
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            "Cancelled",
            "Your employee data is safe :)",
            "error"
          );
        }
      });
  }

  sortList() {
    this.isSortDecreasing = !this.isSortDecreasing;
    this.sortAccordingTo = { name: (this.isSortDecreasing? 1 : -1) };

    this.tabularData();
  }

  handlePaginationResult(type: string) {
    if (type === "prev") {
      if (this.page > 1) {
        this.page--;
        this.tabularData();
      }
    }
    if (type === "next") {
      if (this.dataSize > this.page * this.limit) {
        this.page++;
        this.tabularData();
      }
    }
  }

  handleSearch(value: string) {
    var input: string;
    input = value;
    this.tabularData({
      $or: [
        { name: { $regex: `^${input.toLowerCase().trim()}`, $options: "i" } },
        { role: { $regex: `^${input.toLowerCase().trim()}`, $options: "i" } }
      ]
    });
  }
}
