$(document).ready(function () {

    alert("script.js loaded");

    // Signup button click
    $("#btnSignup").click(function () {

        alert("Signup Button Clicked");

        let email = $("#txtEmail").val();
        let pwd = $("#txtPwd").val();
        let utype = $("#userType").val();

        $.ajax({
            url: "/signup-process",
            type: "POST",
            data: {
                txtEmail: email,
                txtPwd: pwd,
                utype: utype
            },
            success: function (response) {
                alert(response);
            },
            error: function (xhr, status, error) {
                alert("Error : " + error);
            }
        });

    });

    // Email Check
    $("#txtEmail").blur(function () {

        let email = $("#txtEmail").val();

        if (email == "") {
            $("#emailMsg").html("Enter Email");
            return;
        }

        $("#emailMsg").html("Checking...");

        $.ajax({
            url: "/check-email-ajax",
            type: "GET",
            data: {
                emailKuch: email
            },
            success: function (resp) {
                $("#emailMsg").html(resp);
            },
            error: function () {
                alert("Error checking email");
            }
        });

    });

    // Login button
    $("#btnLogin").click(function () {

        let email = $("#txtEmail2").val();
        let pwd = $("#txtPwd2").val();

        $.ajax({
            url: "/do-login",
            type: "POST",
            data: {
                txtEmail2: email,
                txtPwd2: pwd
            },
            success: function (response) {
                alert(response);
            },
            error: function () {
                alert("Login failed");
            }
        });

    });

});