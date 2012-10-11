

var notification = function (msg, type) {
    var n = noty({
        text: msg,
        type: type,
        dismissQueue: true,
        modal: false,
        layout: 'topCenter',
        theme: 'defaultTheme'
    });
};

function DateFormatter(value) {
    var CreatedDate = new Date(value);
    if (typeof (CreatedDate) == "undefined" || value === "") {
        return "";
    }
    return CreatedDate.getDate() + "/" + (CreatedDate.getMonth() + 1) + "/" + CreatedDate.getFullYear();
}