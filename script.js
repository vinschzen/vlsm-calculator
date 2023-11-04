function calculateIPRange(subnet) {
    const [ip, mask] = subnet.split('/');
    const ipParts = ip.split('.').map(Number);
    const subnetMask = parseInt(mask, 10);
    const totalIPs = Math.pow(2, 32 - subnetMask);
    const calculatedIP = `${ip} - ${incrementIP(ip, totalIPs)}`;
    return {
        totalIPs,
        calculatedIP,
    };
}

function calculateIPFirstHalf(subnet) {
    const [ip, mask] = subnet.split('/');
    const ipParts = ip.split('.').map(Number);
    const subnetMask = parseInt(mask, 10);
    const totalIPs1 = Math.pow(2, 32 - subnetMask) / 2;
    const calculatedIP1 = `${ip} - ${incrementIP(ip, totalIPs1 )}`;
    return {
        totalIPs1,
        calculatedIP1,
    };
}

function calculateIPSecondHalf(subnet) {
    const [ip, mask] = subnet.split('/');
    const ipParts = ip.split('.').map(Number);
    const subnetMask = parseInt(mask, 10);
    const totalIPs2 = Math.pow(2, 32 - subnetMask) / 2;
    const calculatedIP2 = `${incrementIP(ip, totalIPs2 + 1)} - ${incrementIP(ip, (totalIPs2*2))}`;
    return {
        totalIPs2,
        calculatedIP2,
    };
}

function makeSpan(ip) {
    var { totalIPs, calculatedIP } = calculateIPRange(ip);
    var subnetInfo = `${ip}`;
    var totalIPsInfo = `Σ ${totalIPs}`;
    var ipRangeInfo = calculatedIP;

    var span = document.createElement("span");
    span.ondblclick  = toClipBoard(span);
    span.innerHTML = `
        ${ip} <br>
        Σ ${totalIPs} <br>
        ${calculatedIP}
    `;
    return span;
}

function makeSpanBranch(ip) {
    var { totalIPs1, calculatedIP1 } = calculateIPFirstHalf(ip);
    var subnetInfo1 = `${ip}`;
    var totalIPsInfo1 = `Σ ${totalIPs1}`;
    var ipRangeInfo1 = calculatedIP1;

    var { totalIPs2, calculatedIP2 } = calculateIPSecondHalf(ip);
    var subnetInfo2 = `${ip}`;
    var totalIPsInfo2 = `Σ ${totalIPs2}`;
    var ipRangeInfo2 = calculatedIP2;

    var spanList = document.createElement("ul");
    spanList.innerHTML = `
            <li> 
                <span ondblclick="toClipBoard(this)">
                    ${ip} <br>
                    Σ<b class="sum-ip">${totalIPs1}</b> <br>
                    ${calculatedIP1}
                </span>
                <ul>
                </ul>
            </li>
            <li> 
                <span ondblclick="toClipBoard(this)">
                    ${ip} <br>
                    Σ<b class="sum-ip">${totalIPs2}</b> <br>
                    ${calculatedIP2}
                </span>
            </li>
    `;

    return spanList;
}

function decrementSubnet(input) {
    const [ip, mask] = input.split('/');
    const subnetMask = parseInt(mask, 10) + 1;
    return `${ip}/${subnetMask}`;
}

document.getElementById("calculateButton").addEventListener("click", function () {
    var subnetInput = document.getElementById("ipInput").value;

    if (subnetInput.length < 5) return;

    var tree = document.getElementById("tree"); 
    tree.innerHTML = "<li></li>";
    var spanTop = makeSpan(subnetInput);
    tree.querySelector("li").appendChild(spanTop);
    var ul = document.createElement("ul");
    tree.querySelector("li").appendChild(ul);
    var prevBranches = [];

    while (subnetInput.slice(-3) != "/32") {
        subnetInput = decrementSubnet(subnetInput);
        var nextBranch = makeSpanBranch(subnetInput);

        prevBranches.push(nextBranch);
    }


    for (let i = 0; i < prevBranches.length; i++) {
        if (i < prevBranches.length - 1) prevBranches[prevBranches.length - 2 - i].querySelector("li").querySelector("ul").append(prevBranches[prevBranches.length - 1 - i]);
    }

    tree.querySelector("li").append(prevBranches[0]);

    var arrLantai = grabAllLantai();
    arrLantai.sort((a, b) => {
        const valueA = parseInt(a.value, 10);
        const valueB = parseInt(b.value, 10);

        return valueA - valueB;
    });

    var arrSpans = document.querySelectorAll(".sum-ip");

    pairAndAppend(arrLantai, arrSpans);

});

function pairAndAppend(arrayA, arrayB) {
    const result = [];

    for (let i = 0; i < arrayA.length; i++) {
            const aValue = arrayA[i].value;
            const bElements = document.querySelectorAll('b');
   
            for (let j = 0; j < bElements.length; j++) {
                const bValue = bElements[j].innerHTML;
                const parentElement = bElements[j].parentNode;
                
                if (bValue < aValue) continue;

                if (bValue/2 >= aValue) continue;

                if (parentElement.id == "done") continue;

                // if ( (bValue/2 < aValue) && (bValue >= aValue) && (parentElement.id != "done") ) {
                    // console.log(`${bValue/2} < ${aValue} && ${bValue} >= ${aValue} `)
                result.push({ indexA: i, indexB: j });

                parentElement.innerHTML += "<br>";
                parentElement.id = "done";
                parentElement.style.backgroundColor = "black";
                parentElement.style.color = "white";

                parentElement.appendChild(document.createTextNode(arrayA[i].id));
                break;
                // }
            }
    }

    return result;
}   


function grabAllLantai()
{
    const lantaiIpElements = document.querySelectorAll(".lantai-ip");
    const ipData = [];

    lantaiIpElements.forEach((input) => {
        const id = input.id;
        const value = input.value;
        ipData.push({ id, value });
    });

    console.log(ipData);
    return ipData;
}


function incrementIP(ip, increment) {
    const ipParts = ip.split('.').map(Number);
    if (ipParts.length !== 4) {
        return "Invalid IP address";
    }

    var segment4 = ipParts[3] + increment - 1;
    var segment3 = ipParts[2] + (segment4/256);
    var segment2 = ipParts[1] + (segment3/256);
    var segment1 = ipParts[0] + (segment2/256);

    ipParts[3] = Math.floor(segment4%256);
    ipParts[2] = Math.floor(segment3%256);
    ipParts[1] = Math.floor(segment2%256);
    ipParts[0] = Math.floor(segment1%256);

    // ipParts[3]+= Math.floor( (ipParts[3] + increment - 1) % 256 );
    // ipParts[2]+= Math.floor( ((ipParts[3] + increment) / 256) % 256 );
    // ipParts[1]+= Math.floor( (((ipParts[3] + increment) / 256) / 256) % 256 );
    // ipParts[0]+= Math.floor( ((((ipParts[3] + increment) / 256) / 256) / 256) % 256 );

    return ipParts.join('.');
}

const table = document.getElementById("ipTable");

table.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-button")) {
    const newRow = document.createElement("tr");
    newRow.className = "slide-from-top";
    newRow.innerHTML = `
        <td>
        <button class="btn btn-danger remove-button" style="display: none"> - </button>
        <button class="btn btn-success add-button"> + </button>
        </td>
        <td> Lantai ${table.rows.length + 1} </td>
        <td> <input type="text" id="lantai-${table.rows.length + 1}" class="lantai-ip" placeholder="100"> IP</td>

    `;

    table.appendChild(newRow);
    updateRemoveButtons();
    } else if (event.target.classList.contains("remove-button")) {
    const row = event.target.closest("tr");
    if (row) {
        row.remove();
        updateRemoveButtons();
    }
    }
});

function updateRemoveButtons() {
    const removeButtons = document.querySelectorAll(".remove-button");
    removeButtons.forEach((button) => (button.style.display = removeButtons.length > 1 ? "inline" : "none"));
}

function toClipBoard(span)
{
    var clonedSpan = span.cloneNode(true);
    var boldElements = clonedSpan.querySelectorAll("b");
    for (var i = 0; i < boldElements.length; i++) {
        var text = document.createTextNode(boldElements[i].textContent);
        boldElements[i].parentNode.replaceChild(text, boldElements[i]);
    }

    var textArea = document.createElement("textarea");
    textArea.value = clonedSpan.innerHTML.replace(/<br>/g, "\n"); 
    document.body.appendChild(textArea);

    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    var copiedToast = new bootstrap.Toast(document.getElementById("copiedToast"));
    var content = document.getElementById("copiedToast").querySelector(".toast-body");
    content.innerHTML = "";
    content.append(clonedSpan);
    copiedToast.show();

}

document.getElementById("refreshButton").addEventListener("click", function () {
    // location.reload(); 
    document.querySelector("#ipTable").innerHTML= `
                        <tr>
                            <th><button class="btn btn-danger remove-button" style="display: none"> - </button>
                                <button class="btn btn-success add-button"> + </button></th>
                            <th>Lantai 1</th>
                            <th><input type="text" placeholder="100"  id="lantai-1" class="lantai-ip"> IP</th>
                        </tr>`;

    document.querySelector("#tree").innerHTML = `
    <li class="list-group-item">
                        <span ondblclick="toClipBoard(this)">
                            192.168.0.0/24 <br>
                            Σ256 <br>
                            192.168.0.0 - 192.168.0.255
                        </span>
                        <ul class="list-group">
                            <li class="list-group-item">
                                <span ondblclick="toClipBoard(this)">
                                    192.168.0.0/23 <br>
                                    Σ128 <br>
                                    192.168.0.0 - 192.168.0.127
                                </span>
                            </li>
                            <li class="list-group-item">
                                <span ondblclick="toClipBoard(this)">
                                    192.168.0.0/23 <br>
                                    Σ128 <br>
                                    192.168.0.128 - 192.168.0.255
                                </span>
                            </li>
                        </ul>
                    </li>
    `;
});
