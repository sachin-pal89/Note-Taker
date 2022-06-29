
// to make this module exportable
export { getDate , getDay};

// to export the detail information about today's date
function getDate()
{
  // given us the current date info
let today = new Date();

// object to specify the attribute of the date obtain
let option = {
    weekday: "long",
    day: "numeric",
    month: "long"
}

return today.toLocaleDateString("en-US", option);
}

// to export only today's day name
function getDay()
{
  // given us the current date info
let today = new Date();

// object to specify the attribute of the date obtain
let option = {
    weekday: "long"
}

return today.toLocaleDateString("en-US", option);

}
