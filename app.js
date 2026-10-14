(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const state = { trip: "return", view: "search", saved: new Set(), flights: [], currentFlights: [], chatHistory: [] };
  const money = (value) => value == null ? "Unknown" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);
  const today = new Date(); today.setDate(today.getDate() + 30);
  const dateString = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  $("departDate").value = dateString(today);
  const ret = new Date(today); ret.setDate(ret.getDate() + 7); $("returnDate").value = dateString(ret);
  $("departDate").min = dateString(new Date());
  $("returnDate").min = $("departDate").value;

  // Fictional fixtures are deliberately labelled DEMO. No prices here are live or bookable.
  const demoFlights = [
    {id:"ts-demo-1",airline:"British Airways",code:"BA",fare:"Economy Basic",base:468,taxes:87,bag:65,seat:42,flex:74,duration:435,stops:0,depart:"08:25",arrive:"11:55",from:"LHR",to:"JFK",baggage:"23kg checked bag",seatIncluded:false,bagIncluded:false,flexIncluded:false,meal:"Unknown",source:"DEMO DATA",bookingUrl:null,tag:"BEST VALUE",tagType:"blue",notes:"Example fare only. Inclusions and costs are fictional."},
    {id:"ts-demo-2",airline:"Virgin Atlantic",code:"VS",fare:"Economy Classic",base:522,taxes:91,bag:0,seat:0,flex:58,duration:450,stops:0,depart:"10:10",arrive:"13:40",from:"LHR",to:"JFK",baggage:"23kg included",seatIncluded:true,bagIncluded:true,flexIncluded:false,meal:"Unknown",source:"DEMO DATA",bookingUrl:null,tag:"BAGS + SEATS",tagType:"",notes:"Example fare only. Inclusions and costs are fictional."},
    {id:"ts-demo-3",airline:"Iberia",code:"IB",fare:"Basic",base:389,taxes:94,bag:null,seat:null,flex:null,duration:515,stops:1,depart:"07:35",arrive:"13:10",from:"LHR",to:"JFK",baggage:"Unknown",seatIncluded:null,bagIncluded:null,flexIncluded:null,meal:"Unknown",source:"DEMO DATA",bookingUrl:null,tag:"LOWEST TICKET",tagType:"",notes:"Example fare only. Required add-on costs are unknown."},
    {id:"ts-demo-4",airline:"Lufthansa",code:"LH",fare:"Economy Flex",base:611,taxes:78,bag:0,seat:0,flex:0,duration:490,stops:1,depart:"09:00",arrive:"14:10",from:"LHR",to:"JFK",baggage:"23kg included",seatIncluded:true,bagIncluded:true,flexIncluded:true,meal:"Unknown",source:"DEMO DATA",bookingUrl:null,tag:"FLEXIBLE",tagType:"blue",notes:"Example fare only. Inclusions and costs are fictional."}
  ];
  function totalFor(f) {
    let total = f.base + f.taxes;
    const unknown = [];
    if ($("checkedBag").checked) {
      if (f.bagIncluded === true) {} else if (f.bag == null || f.bagIncluded == null) unknown.push("checked baggage"); else total += f.bag;
    }
    if ($("seatTogether").checked) {
      if (f.seatIncluded === true) {} else if (f.seat == null || f.seatIncluded == null) unknown.push("seat selection"); else total += f.seat * Math.max(1, passengerCount());
    }
    if ($("flexible").checked) {
      if (f.flexIncluded === true) {} else if (f.flex == null || f.flexIncluded == null) unknown.push("flexibility"); else total += f.flex;
    }
    return { total, unknown };
  }
  function passengerCount() { const v = $("travellers").value; return v.includes(",") ? v.split(",").map(Number).reduce((a,b)=>a+b,0) : Number(v); }
  function fmtDuration(minutes) { const h=Math.floor(minutes/60),m=minutes%60; return `${h}h ${m}m`; }
  function inclusion(icon, text, status) { return `<div class="inclusion ${status}"><span class="inc-icon">${icon}</span><span class="inc-text">${text}</span></div>`; }
  function flightCard(f) {
    const calc = totalFor(f), passengers = passengerCount(), baseParty = (f.base + f.taxes) * passengers;
    const totalParty = calc.total * passengers;
    const bagState = f.bagIncluded === true ? "yes" : f.bagIncluded === false && f.bag != null ? "no" : "unknown";
    const seatState = f.seatIncluded === true ? "yes" : f.seatIncluded === false && f.seat != null ? "no" : "unknown";
    const flexState = f.flexIncluded === true ? "yes" : f.flexIncluded === false && f.flex != null ? "no" : "unknown";
    const bagLabel = bagState === "yes" ? "Checked bag included" : bagState === "no" ? `Bag +${money(f.bag)}` : "Bag cost unknown";
    const seatLabel = seatState === "yes" ? "Seat selection included" : seatState === "no" ? `Seats +${money(f.seat)}/person` : "Seat cost unknown";
    const flexLabel = flexState === "yes" ? "Flexible fare" : flexState === "no" ? `Flex +${money(f.flex)}` : "Flex rules unknown";
    const canCompare = calc.unknown.length === 0;
    return `<article class="flight-card ${f.tag==="BEST VALUE"?"best":""}" data-flight="${f.id}">
      <div class="flight-top"><div class="airline-logo">${f.code}</div><div><div class="airline-name">${f.airline} ${f.tag?`<span class="result-tag ${f.tagType}">${f.tag}</span>`:""}</div><div class="fare-name">${f.fare} · <span style="color:#a0aabd">${f.source}</span></div></div><div class="price-box"><strong>${money(f.base+f.taxes)}</strong><small>per person · ticket only</small></div></div>
      <div class="flight-timing"><div class="time-place"><strong>${f.depart}</strong><span>${f.from} · departure</span></div><div class="journey-line"><div class="duration">${fmtDuration(f.duration)}</div><div class="line-wrap ${f.stops===0?"direct":""}"><i></i><span></span><i></i></div><div class="stops ${f.stops?"stop":""}">${f.stops===0?"Direct":`${f.stops} stop`}</div></div><div class="time-place"><strong>${f.arrive}</strong><span>${f.to} · arrival</span></div></div>
      <div class="inclusions">${inclusion("▱", f.bagIncluded===true?"23kg checked bag":f.bagIncluded===false&&f.bag!=null?"Checked bag extra":"Bag allowance unknown",bagState)}${inclusion("▣",f.seatIncluded===true?"Seat selection included":f.seatIncluded===false&&f.seat!=null?"Seat selection extra":"Seat rules unknown",seatState)}${inclusion("↻",f.flexIncluded===true?"Flexible changes":f.flexIncluded===false&&f.flex!=null?"Changes cost extra":"Change rules unknown",flexState)}${inclusion("✦",f.stops===0?"Non-stop journey":`${f.stops} connection${f.stops>1?"s":""}`,f.stops===0?"yes":"no")}</div>
      <div class="flight-bottom"><span class="total-label">Estimated comparable total</span><span class="total-price">${canCompare?money(totalParty):money(totalParty)+"+"}<small> / ${passengers} traveller${passengers===1?"":"s"}</small></span><span class="cost-detail">${calc.unknown.length?`Excludes unknown: ${calc.unknown.join(", ")}`:`Includes selected extras`}</span><div class="card-actions"><button class="save-btn ${state.saved.has(f.id)?"saved":""}" data-save="${f.id}">${state.saved.has(f.id)?"♥ Saved":"♡ Save"}</button><button class="details-btn" data-details="${f.id}">Fare details →</button></div></div>
    </article>`;
  }
  function activeFilteredFlights() {
    let list = [...state.flights];
    if ($("directOnly").checked) list = list.filter(f=>f.stops===0);
    const sort=$("sortSelect").value;
    list.sort((a,b)=>{
      if(sort==="duration") return a.duration-b.duration;
      if(sort==="base") return a.base-b.base;
      if(sort==="value") return score(b)-score(a);
      const ta=totalFor(a),tb=totalFor(b);
      if(ta.unknown.length!==tb.unknown.length) return ta.unknown.length-tb.unknown.length;
      return ta.total-tb.total;
    });
    return list;
  }
  function score(f) { return (f.bagIncluded?3:0)+(f.seatIncluded?2:0)+(f.flexIncluded?2:0)+(f.stops===0?2:0)-f.base/300; }
  function renderFlights() {
    const list=activeFilteredFlights(); state.currentFlights=list;
    $("flightList").innerHTML=list.length?list.map(flightCard).join(""):`<div class="empty-state"><strong>No demo offers match those filters.</strong>Try turning off “Direct only” or changing your requirements. Live search is not connected yet.</div>`;
    $("resultsTitle").textContent=`${list.length} example ${list.length===1?"option":"options"} to compare`;
    $("resultsSubtitle").textContent=`${$("origin").value} to ${$("destination").value} · ${$("cabin").value} · illustrative data only`;
    $("needBag").textContent=$("checkedBag").checked?"Required":"Not required";
    $("needSeats").textContent=$("seatTogether").checked?"Required":"Not required";
    $("needDirect").textContent=$("directOnly").checked?"Direct only":"Flexible";
    $("needFlex").textContent=$("flexible").checked?"Required":"Not required";
    const viable=list.filter(f=>totalFor(f).unknown.length===0).sort((a,b)=>totalFor(a).total-totalFor(b).total);
    $("insightText").textContent=viable.length?`${viable[0].airline} has the lowest calculated total among offers with known prices for your selected extras. All offers are fictional demo data, so verify real fare rules with the airline.`:"Some selected extras have unknown prices. TicketSmart keeps those costs visible instead of treating them as free.";
    $("savedCount").textContent=state.saved.size;
  }
  function doSearch(e) {
    if(e)e.preventDefault();
    if($("returnDate").value && $("departDate").value && $("returnDate").value < $("departDate").value && state.trip==="return"){toast("Return date must be on or after departure.");return;}
    state.flights=demoFlights.map(f=>({...f}));
    renderFlights();
    $("resultsSection").scrollIntoView({behavior:"smooth",block:"start"});
    toast("Demo comparison updated. No live airline prices were fetched.");
  }
  $("flightForm").addEventListener("submit",doSearch);
  $("sortSelect").addEventListener("change",renderFlights);
  ["checkedBag","seatTogether","directOnly","flexible","travellers"].forEach(id=>$(id).addEventListener("change",renderFlights));
  $("departDate").addEventListener("change",()=>{$("returnDate").min=$("departDate").value;if($("returnDate").value<$("departDate").value)$("returnDate").value=$("departDate").value;});
  $("swapBtn").addEventListener("click",()=>{const a=$("origin").value;$("origin").value=$("destination").value;$("destination").value=a;});
  document.querySelectorAll(".trip-tab").forEach(btn=>btn.addEventListener("click",()=>{
    if(btn.dataset.trip==="multicity"){toast("Multi-city search is planned but not implemented in this MVP.");return;}
    state.trip=btn.dataset.trip;document.querySelectorAll(".trip-tab").forEach(b=>b.classList.toggle("active",b===btn));
    $("returnField").classList.toggle("hidden",state.trip==="oneway");$("returnDate").required=state.trip==="return";
  }));
  $("newSearchBtn").addEventListener("click",()=>{$("searchPanel").scrollIntoView({behavior:"smooth"});$("origin").focus();});
  $("dismissBanner").addEventListener("click",()=>document.querySelector(".demo-banner").classList.add("hidden"));
  const modalText = {
    about:`<p>TicketSmart is a flight-fare comparison prototype focused on the total cost of travel: ticket, baggage, seat selection and flexibility. It is not affiliated with any airline or comparison website.</p><p><strong>Current status:</strong> the interface and fare-calculation demo work locally in your browser. No airline API, live price feed, AI model, account backend or booking flow is connected yet.</p>`,
    sources:`<p>Airline-direct pricing requires authorised access to airline inventory, pricing and fare-rule data. The app must not scrape restricted sites or pretend example fares are bookable.</p><div class="modal-list"><div class="modal-item"><span>✓</span><div><strong>Live verified</strong><p>Only available after an authorised provider responds with a current offer.</p></div></div><div class="modal-item"><span>◷</span><div><strong>Cached indicative</strong><p>Must show its last checked time and must be revalidated before booking.</p></div></div><div class="modal-item"><span>ⓘ</span><div><strong>Demo data</strong><p>Fictional examples used here to test comparisons. Not live and not bookable.</p></div></div></div>`,
    details:`<p>Fare details show the example fare's inclusion states and the logic used to calculate the total. A missing value is shown as unknown, never as a free inclusion.</p>`
  };
  function openModal(title,html){$("modalTitle").textContent=title;$("modalContent").innerHTML=html;$("modalBackdrop").hidden=false;$("modalClose").focus();}
  $("helpBtn").addEventListener("click",()=>openModal("TicketSmart prototype",modalText.about));
  $("sourceInfoBtn").addEventListener("click",()=>openModal("How source verification works",modalText.sources));
  $("modalClose").addEventListener("click",()=>$("modalBackdrop").hidden=true);
  $("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))$("modalBackdrop").hidden=true;});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")$("modalBackdrop").hidden=true;});
  $("flightList").addEventListener("click",e=>{
    const save=e.target.closest("[data-save]"),detail=e.target.closest("[data-details]");
    if(save){const id=save.dataset.save;if(state.saved.has(id))state.saved.delete(id);else state.saved.add(id);renderFlights();return;}
    if(detail){const f=state.flights.find(x=>x.id===detail.dataset.details);if(!f)return;
      const c=totalFor(f);openModal(`${f.airline} · ${f.fare}`,`<p><strong>Source:</strong> Demonstration fixture — not a live airline offer.</p><p><strong>Ticket-only price:</strong> ${money(f.base+f.taxes)} per traveller (fictional).</p><p><strong>Selected extras:</strong> ${c.unknown.length?`Unknown pricing for ${c.unknown.join(", ")}. These are excluded from the displayed calculation.`:"All selected extras have example prices or are marked included."}</p><p><strong>Baggage:</strong> ${f.baggage}. <strong>Seat selection:</strong> ${f.seatIncluded===true?"Example says included":f.seatIncluded===false?"Example says extra":"Unknown"}. <strong>Flexibility:</strong> ${f.flexIncluded===true?"Example says included":f.flexIncluded===false?"Example says extra":"Unknown"}.</p><p>There is no booking link because this is not a real offer. Verify current details on the airline's official website.</p>`);}
  });
  function addMessage(text,who) {
    const row=document.createElement("div");row.className=`message ${who}`;
    if(who==="assistant"){const av=document.createElement("div");av.className="chat-avatar";av.textContent="✦";row.appendChild(av);}
    const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=text;row.appendChild(bubble);
    $("chatMessages").appendChild(row);$("chatMessages").scrollTop=$("chatMessages").scrollHeight;
  }
  function answerFor(message) {
    const m=message.toLowerCase(),list=state.currentFlights.length?state.currentFlights:demoFlights;
    if(/live|real price|actual price|bookable|book it|booking/.test(m)) return "Live airline pricing and booking are not connected in this prototype. The visible fares are fictional demo data and cannot be booked. To enable live results, configure an authorised airline-direct API or NDC connection on a secure backend and revalidate each fare before sending the user to the airline.";
    if(/bag|baggage|luggage|23kg|checked/.test(m)) {
      const known=list.filter(f=>f.bagIncluded===true||f.bag!=null).sort((a,b)=>totalFor(a).total-totalFor(b).total);
      return known.length?`For your checked-bag requirement, compare the full cost rather than the headline fare. In this demo, ${known[0].airline} has a ${known[0].bagIncluded?"sample fare marked as including a bag":`sample bag add-on of ${money(known[0].bag)}`}. These are fictional values, not current airline policy. Unknown baggage costs remain unpriced.`:"The checked-bag inclusions and add-on prices are unknown for these offers. TicketSmart should not assume a bag is free.";}
    if(/seat|together|partner/.test(m)) return "For seats together, check whether standard seat selection is included for every traveller. If it is paid, multiply the seat fee by the number of passengers. A seat-selection fee does not necessarily guarantee adjacent seats unless the airline confirms that.";
    if(/flex|change|refund|cancel/.test(m)) return "Fare flexibility varies by fare family and route. Compare the exact change fee, fare difference and refund conditions. This demo does not contain verified fare rules, so I can't confirm whether any example ticket is refundable.";
    if(/cheap|lowest|best value|compare|save|cost/.test(m)) {
      const sorted=list.map(f=>({f,c:totalFor(f)})).sort((a,b)=>{if(a.c.unknown.length!==b.c.unknown.length)return a.c.unknown.length-b.c.unknown.length;return a.c.total-b.c.total;});
      const x=sorted[0];return `Based on the selected requirements, ${x.f.airline} is currently the lowest calculated option among the visible demo offers${x.c.unknown.length?`, but the total is incomplete because ${x.c.unknown.join(" and ")} pricing is unknown`:" with known selected-extra prices"}. The ticket-only fare is ${money(x.f.base+x.f.taxes)} per traveller. Remember: these are fictional demo figures, not live prices.`;
    }
    if(/tokyo|bangkok|new york|london|gatwick|heathrow|date|june|spring|friday/.test(m)) return "I can understand that trip request, but this prototype doesn't yet query airline inventory or resolve real schedules. Use the search form to set your route and dates; the example comparison will update its labels, while live prices remain unavailable until an authorised airline data provider is connected.";
    return "I can help compare headline fares, checked baggage, seats and flexibility using the example offers on screen. This prototype has no live airline feed or connected language-model API, so I won't invent current prices or fare rules. Try asking: “Which option has the lowest total with a checked bag?”";
  }
  $("chatForm").addEventListener("submit",e=>{e.preventDefault();const input=$("chatInput"),msg=input.value.trim();if(!msg)return;addMessage(msg,"user");input.value="";setTimeout(()=>addMessage(answerFor(msg),"assistant"),150);});
  document.querySelectorAll(".prompt-chip").forEach(btn=>btn.addEventListener("click",()=>{$("chatInput").value=btn.dataset.prompt;$("chatInput").focus();}));
  $("askAiBtn").addEventListener("click",()=>{$("chatInput").focus();$("chatSection").scrollIntoView({behavior:"smooth",block:"start"});});
  document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{
    const view=btn.dataset.view;state.view=view;document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b===btn));
    $("topSection").textContent=view==="search"?"Flight search":view==="saved"?"Saved flights":"Price watch";
    if(view==="search"){$("searchPanel").scrollIntoView({behavior:"smooth"});return;}
    if(view==="alerts"){openModal("Price watch",`<p>Price tracking is planned for a later version. This static GitHub Pages demo cannot run background jobs or send alerts while the page is closed.</p><p>A production version needs a backend, persistent database, scheduled fare refreshes and notification service. No price history is fabricated here.</p>`);return;}
    const saved=state.flights.filter(f=>state.saved.has(f.id));
    openModal("Saved flights",saved.length?`<p>You saved ${saved.length} example offer(s):</p><ul>${saved.map(f=>`<li>${f.airline} — ${f.fare} — demo fare ${money(f.base+f.taxes)}</li>`).join("")}</ul><p>Saved selections currently last only until you refresh or close this page.</p>`:`<p>You haven't saved any example flights yet. Select ♡ Save on a result to keep it in this session.</p>`);
  }));
  $("origin").addEventListener("change",()=>{const v=$("origin").value.toLowerCase();document.querySelector(".airport-field .airport-code").textContent=v.includes("gatwick")?"LGW":v.includes("heathrow")?"LHR":v.includes("new york")?"NYC":v.includes("london")?"LON":"—";});
  $("destination").addEventListener("change",()=>{const v=$("destination").value.toLowerCase();document.querySelectorAll(".airport-code")[1].textContent=v.includes("new york")?"NYC":v.includes("tokyo")?"TYO":v.includes("bangkok")?"BKK":v.includes("london")?"LON":"—";});
  let toastTimer;function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2800);}
  renderFlights();
})(); 
