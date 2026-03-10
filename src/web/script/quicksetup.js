/* 
    Quick Setup Tour

    This script file contains all the required script
    for quick setup tour and walkthrough
*/

//tourStepFactory generate a function that renders the steps in tourModal
//Keys: {element, title, desc, tab, pos, scrollto, callback}
//      elements -> Element (selector) to focus on
//      tab -> Tab ID to switch pages
//      pos -> Where to display the tour modal, {topleft, topright, bottomleft, bottomright, center}
//      scrollto -> Element (selector) to scroll to, can be different from elements
//      ignoreVisiableCheck -> Force highlight even if element is currently not visable
function adjustTourModalOverlayToElement(element){;
    if ($(element) == undefined || $(element).offset() == undefined){
        return;
    }

    let padding = 12;
    $("#tourModalOverlay").css({
        "top": $(element).offset().top - padding - $(document).scrollTop(),
        "left": $(element).offset().left - padding,
        "width": $(element).width() + 2 * padding,
        "height": $(element).height() + 2 * padding,
    });
}

var tourOverlayUpdateTicker;

function tourStepFactory(config){
    return function(){
         //Check if this step require tab swap
         if (config.tab != undefined && config.tab != ""){
            //This tour require tab swap. call to openTabById
            openTabById(config.tab);
        }

        if (config.ignoreVisiableCheck == undefined){
            config.ignoreVisiableCheck = false;
        }
        
        if (config.element == undefined || (!$(config.element).is(":visible") && !config.ignoreVisiableCheck)){
            //No focused element in this step.
            $(".tourFocusObject").removeClass("tourFocusObject");
            $("#tourModal").addClass("nofocus");
            $("#tourModalOverlay").hide();

            //If there is a target element to scroll to
            if (config.scrollto != undefined){
                $('html, body').animate({
                    scrollTop: $(config.scrollto).offset().top - 100
                }, 500);
            }

        }else{

            let elementHighligher = function(){
                //Match the overlay to element position and size
                $(window).off("resize").on("resize", function(){
                    adjustTourModalOverlayToElement(config.element);
                });
                if (tourOverlayUpdateTicker != undefined){
                    clearInterval(tourOverlayUpdateTicker);
                }
                tourOverlayUpdateTicker = setInterval(function(){
                    adjustTourModalOverlayToElement(config.element);
                }, 500);
                adjustTourModalOverlayToElement(config.element);
                $("#tourModalOverlay").fadeIn();
            }

            //Consists of focus element in this step
            $(".tourFocusObject").removeClass("tourFocusObject");
            $(config.element).addClass("tourFocusObject");
            $("#tourModal").removeClass("nofocus");
            $("#tourModalOverlay").hide();
             //If there is a target element to scroll to
             if (config.scrollto != undefined){
                $('html, body').animate({
                    scrollTop: $(config.scrollto).offset().top - 100
                }, 300, function(){
                    setTimeout(elementHighligher, 300);
                });
            }else{
                setTimeout(elementHighligher, 300);
            }
        }

        //Get the modal location of this step
        let showupZone = "center";
        if (config.pos != undefined){
            showupZone = config.pos
        }

        $("#tourModal").attr("position", showupZone);

        $("#tourModal .tourStepTitle").html(config.title);
        $("#tourModal .tourStepContent").html(config.desc);
        if (config.callback != undefined){
            config.callback();
        }

       
    }
}

//Hide the side warpper in tour mode and prevent body from restoring to
//overflow scroll mode
function hideSideWrapperInTourMode(){
    hideSideWrapper(); //Call to index.html hide side wrapper function
    $("body").css("overflow", "hidden"); //Restore overflow state
}

function startQuickStartTour(){
    if (currentQuickSetupClass == ""){
        msgbox("请先选择要进行的配置向导", false);
        return;
    }   
    //Show the tour modal
    $("#tourModal").show();
    //Load the tour steps
    if (tourSteps[currentQuickSetupClass] == undefined || tourSteps[currentQuickSetupClass].length == 0){
        //This tour is not defined or empty
        let notFound = tourStepFactory({
            title: "😭 未找到导览",
            desc: "您请求的导览尚未开发，请稍后再试！"
        });
        notFound();

        //Enable the finish button
        $("#tourModal .nextStepAvaible").hide();
        $("#tourModal .nextStepFinish").show();

        //Set step counter to 1
        $("#tourModal .tourStepCounter").text("0 / 0");
        return;
    }else{
        tourSteps[currentQuickSetupClass][0]();
    }
    
    updateTourStepCount();
    
    //Disable the previous button
    if (tourSteps[currentQuickSetupClass].length == 1){
        //There are only 1 step in this tour
        $("#tourModal .nextStepAvaible").hide();
        $("#tourModal .nextStepFinish").show();
    }else{
        $("#tourModal .nextStepAvaible").show();
        $("#tourModal .nextStepFinish").hide();
    }
    $("#tourModal .tourStepButtonBack").addClass("disabled");

    //Disable body scroll and let tour steps to handle scrolling
    $("body").css("overflow-y","hidden");
    $("#mainmenu").css("pointer-events", "none");
}

function updateTourStepCount(){
    let tourlistLength = tourSteps[currentQuickSetupClass]==undefined?1:tourSteps[currentQuickSetupClass].length;
    $("#tourModal .tourStepCounter").text((currentQuickSetupTourStep + 1) + " / " + tourlistLength);
}

function nextTourStep(){
    //Add one to the tour steps
    currentQuickSetupTourStep++;
    if (currentQuickSetupTourStep == tourSteps[currentQuickSetupClass].length - 1){
        //Already the last step
        $("#tourModal .nextStepAvaible").hide();
        $("#tourModal .nextStepFinish").show();
    }
    updateTourStepCount();
    tourSteps[currentQuickSetupClass][currentQuickSetupTourStep]();
    if (currentQuickSetupTourStep > 0){
        $("#tourModal .tourStepButtonBack").removeClass("disabled");
    }
}

function previousTourStep(){
    if (currentQuickSetupTourStep > 0){
        currentQuickSetupTourStep--;
    }

    if (currentQuickSetupTourStep != tourSteps[currentQuickSetupClass].length - 1){
        //Not at the last step
        $("#tourModal .nextStepAvaible").show();
        $("#tourModal .nextStepFinish").hide();
    }

    if (currentQuickSetupTourStep == 0){
        //Cant go back anymore
        $("#tourModal .tourStepButtonBack").addClass("disabled");
    }
    updateTourStepCount();
    tourSteps[currentQuickSetupClass][currentQuickSetupTourStep]();
}

//End tour and reset everything
function endTourFocus(){
    $(".tourFocusObject").removeClass("tourFocusObject");
    $(".serviceOption.active").removeClass("active");
    currentQuickSetupClass = "";
    currentQuickSetupTourStep = 0;
    $("#tourModal").hide();
    $("#tourModal .nextStepAvaible").show();
    $("#tourModal .nextStepFinish").hide();
    $("#tourModalOverlay").hide();
    if (tourOverlayUpdateTicker != undefined){
        clearInterval(tourOverlayUpdateTicker);
    }
    $("body").css("overflow-y","auto");
    $("#mainmenu").css("pointer-events", "auto");
}


var tourSteps = {
    //Homepage steps
    "homepage": [
        tourStepFactory({
            title: "🎉 恭喜，开始搭建你的第一个站点！",
            desc: "本向导将引导你使用自己的域名在 Zoraxy 上搭建一个基础静态网站。"
        }),
        tourStepFactory({
            title: "👉 将域名 DNS 指向 Zoraxy 的 IP",
            desc: `添加一条 DNS A 记录，将你的域名指向本 Zoraxy 实例的公网 IP。<br>
            假设公网 IP 为 93.184.215.14，可参考如下 A 记录：
            <table class="ui celled collapsing basic striped table">
                <thead>
                    <tr>
                        <th>名称</th>
                        <th>类型</th>
                        <th>值</th>
                    </tr>   
                </thead>
                <tbody>
                    <tr>
                        <td>yourdomain.com</td>
                        <td>A</td>
                        <td>93.184.215.14</td>
                    </tr>
                </tbody>
            </table>
            <br>若 Zoraxy 的 IP 以 192.168 开头，请使用路由器公网 IP，并做好 80 和 443 端口转发。`,
            callback: function(){
                $.get("/api/acme/wizard?step=10", function(data){
                    if (data.error == undefined){
                        //Should return the public IP address from acme wizard
                        //Overwrite the sample IP address
                        let originalText = $("#tourModal .tourStepContent").html();
                        originalText = originalText.split("93.184.215.14").join(data);
                        $("#tourModal .tourStepContent").html(originalText);
                    }
                })
            }
        }),
        tourStepFactory({
            title: "🏠 设置默认站点",
            desc: `若已有 Apache 或 Nginx 在运行，选择「反向代理目标」并填入当前 Web 服务器地址。<br>否则选择「内置静态 Web 服务器」并点击「应用更改」。`,
            tab: "setroot",
            element: "#setroot",
            pos: "bottomright"
        }),
        tourStepFactory({
            title: "🌐 启用静态 Web 服务器",
            desc: `若尚未启用，请启用静态 Web 服务器。若使用 Apache、Nginx 等外部服务器可跳过此步。`,
            tab: "webserv",
            element: "#webserv",
            pos: "bottomright"
        }),
        tourStepFactory({
            title: "📤 上传静态网站",
            desc: `将静态网站文件（如 HTML）上传到 Web 目录。若无法远程访问，也可使用本页的文件管理器上传。`,
            tab: "webserv",
            element: "#webserv_dirManager",
            pos: "bottomright",
            scrollto: "#webserv_dirManager"
        }),
        tourStepFactory({
            title: "💡 启动 Zoraxy HTTP 监听",
            desc: `点击「启动服务」按钮启动 Zoraxy（若尚未运行）。<br>此时访问你的域名即可在浏览器中看到静态网站内容。`,
            tab: "status",
            element: "#status .poweroptions",
            pos: "bottomright",
        })
    ],

    //Subdomains tour steps
    "subdomain":[
        tourStepFactory({
            title: "🎉 创建你的第一个子域名",
            desc: "准备为站点扩展更多服务时，可以为新服务创建子域名。<br><br>本向导将引导你配置一个新的子域名反向代理。",
            pos: "center"
        }),
        tourStepFactory({
            title: "👉 将子域名 DNS 指向 Zoraxy",
            desc: `添加一条 DNS CNAME 记录，将子域名指向根域名。<br>
            假设公网 IP 为 93.184.215.14，可参考如下记录：
            <table class="ui celled collapsing basic striped table">
                <thead>
                    <tr>
                        <th>名称</th>
                        <th>类型</th>
                        <th>值</th>
                    </tr>   
                </thead>
                <tbody>
                    <tr>
                        <td>example.com</td>
                        <td>A</td>
                        <td>93.184.215.14</td>
                    </tr>
                    <tr>
                        <td>sub.example.com</td>
                        <td>CNAME</td>
                        <td>example.com</td>
                    </tr>
                </tbody>
            </table>`,
            callback: function(){
                $.get("/api/acme/wizard?step=10", function(data){
                    if (data.error == undefined){
                        //Should return the public IP address from acme wizard
                        //Overwrite the sample IP address
                        let originalText = $("#tourModal .tourStepContent").html();
                        originalText = originalText.split("93.184.215.14").join(data);
                        $("#tourModal .tourStepContent").html(originalText);
                    }
                })
            }
        }),
        tourStepFactory({
            title: "➕ 新建代理规则",
            desc: `接下来创建一条代理规则，将新子域名做反向代理。可在「新建代理规则」表单中轻松添加。`,
            tab: "rules",
            pos: "topright"
        }),
        tourStepFactory({
            title: "🌐 匹配关键词 / 域名",
            desc: `在「匹配关键词 / 域名」中填写新子域名。<br>例如：sub.example.com`,
            element: "#rules .field[tourstep='matchingkeyword']",
            pos: "bottomright"
        }),
        tourStepFactory({
            title: "🖥️ 目标 IP 或域名及端口",
            desc: `填写反向代理目标，如 localhost:8080 或 192.168.1.100:9096。<br><br>请确保该服务可从 Zoraxy 访问。`,
            element: "#rules .field[tourstep='targetdomain']",
            pos: "bottomright"
        }),
        tourStepFactory({
            title: "🔐 代理目标需要 TLS",
            desc: `若上游服务仅接受 HTTPS，请勾选此项。`,
            element: "#rules .field[tourstep='requireTLS']",
            pos: "bottomright",
           
        }),
        tourStepFactory({
            title: "🔓 忽略 TLS 验证错误",
            desc: `Proxmox、NextCloud 等使用自签名证书的 Web 界面，若需代理此类服务，请启用此项。`,
            element: "#rules #advanceProxyRules .field[tourstep='skipTLSValidation']",
            scrollto: "#rules #advanceProxyRules",
            pos: "bottomright",
            ignoreVisiableCheck: true,
            callback: function(){
                $("#advanceProxyRules").accordion();
                if (!$("#rules #advanceProxyRules .content").is(":visible")){
                    $("#rules #advanceProxyRules .title")[0].click()
                }
            }
        }),
        tourStepFactory({
            title: "💾 保存新代理规则",
            desc: `点击「创建端点」将此反向代理规则加入运行配置。`,
            element: "#rules div[tourstep='newProxyRule']",
            scrollto: "#rules div[tourstep='newProxyRule']",
            pos: "topright",
        }),
        tourStepFactory({
            title: "🎉 新代理规则已就绪！",
            desc: `可继续在此表单添加更多子域名或别名。在「HTTP 代理」标签页可查看已创建的规则。`,
            element: "#rules",
            tab: "rules",
            pos: "bottomright",
        }),
        tourStepFactory({
            title: "🌲 HTTP 代理列表",
            desc: `本页展示所有 HTTP 代理规则并可编辑。你新建的规则应出现在上方列表中。<br><br>
                    本向导到此结束。访问控制、负载均衡等说明请参阅 Github Wiki。`,
            element: "#httprp",
            tab: "httprp",
            pos: "bottomright",
        }),
    ],

    //TLS and ACME tour steps
    "tls":[
        tourStepFactory({
            title: "🔐 为站点启用 HTTPS (TLS)",
            desc: `部分技术因安全要求仅支持 HTTPS。本向导将引导你在 Zoraxy 中启用 HTTPS。`,
            pos: "center",
        }),
        tourStepFactory({
            title: "➡️ 修改监听端口",
            desc: `HTTPS 使用 443 端口。若当前监听的不是 443，请在「入站端口」中改为 443 并点击「应用」。`,
            tab: "status",
            element: "#status div[tourstep='incomingPort']",
            scrollto: "#status div[tourstep='incomingPort']",
            pos: "bottomright",
        }),
        tourStepFactory({
            title: "🔑 启用 TLS 服务",
            desc: `勾选「使用 TLS 处理代理请求」以启用 TLS。`,
            element: "#tls",
            scrollto: "#tls",
            pos: "bottomright",
        }),
        tourStepFactory({
            title: "💻 在 80 端口启用 HTTP",
            desc: `若希望部分规则仍可通过 HTTP 访问，请同时开启 80 端口的 HTTP 监听。`,
            element: "#listenP80",
            scrollto: "#tls",
            pos: "bottomright",
        }),
        tourStepFactory({
            title: "↩️ 强制将 HTTP 重定向到 HTTPS",
            desc: `默认情况下，未匹配的 HTTP 请求会返回 404。自建场景下通常希望自动重定向到 HTTPS。<br><br>启用此选项即可自动重定向。`,
            element: "#status div[tourstep='forceHttpsRedirect']",
            scrollto: "#tls",
            pos: "bottomright",
        }),
        tourStepFactory({
            title: "🎉 HTTPS 已启用！",
            desc: `当前 Zoraxy 已可处理 HTTPS 请求。<br><br>默认使用内置自签名证书，不适合正式环境。请向 CA 或服务商申请正式证书。`,
            tab: "status",
            pos: "center",
        }),
        tourStepFactory({
            title: "🔐 TLS / SSL 证书",
            desc: `Zoraxy 提供证书管理界面，可上传或申请证书。从侧栏点击「TLS/SSL 证书」进入本页。`,
            tab: "cert",
            element: "#mainmenu",
            pos: "center",
        }),
        tourStepFactory({
            title: "⚙️ 配置 ACME",
            desc: `若不想付费购买证书，可使用免费 CA。默认使用 Let's Encrypt，需在「ACME 邮箱」中填写联系邮箱。<br><br>填写后点击「保存设置」并继续。`,
            element: "#cert div[tourstep='acmeSettings']",
            scrollto: "#cert div[tourstep='acmeSettings']",
            pos: "bottomright",
        }),
        tourStepFactory({
            title: "👉 打开 ACME 工具",
            desc: `点击 ACME 设置下方的按钮打开 ACME 工具，侧边会弹出工具窗口。`,
            element: ".sideWrapper",
            pos: "center",
            callback: function(){
                openACMEManager();
            }
        }),
        tourStepFactory({
            title: "📃 通过 ACME 申请证书",
            desc: `在「生成新证书」表单中填写信息并点击 <b>「获取证书」</b>，向所选 CA 申请免费证书。通常需等待数分钟，待加载图标消失后再进行下一步。<br><br>提示：申请含通配符 (*) 的证书可勾选「使用 DNS 验证」。`,
            element: ".sideWrapper",
            pos: "topleft",
        }),
        tourStepFactory({
            title: "🔄 启用自动续期",
            desc:`免费证书有效期较短。若希望 Zoraxy 自动续期，请点击 <b>「启用证书自动续期」</b> 开关。<br><br>可在「高级续期策略」中细调要续期的证书。`,
            element: ".sideWrapper",
            pos: "bottomleft",
            callback: function(){
                if (!$(".sideWrapper").is(":visible")){
                    openACMEManager();
                }
            }
        }),
        tourStepFactory({
            title: "🎉 证书已安装！",
            desc: `证书已写入并可使用。Zoraxy 会自动为域名匹配证书，无需手动绑定。<br><br>现在可用 https:// 访问站点，地址栏会显示绿色锁标。`,
            element: "#cert div[tourstep='certTable']",
            scrollto: "#cert div[tourstep='certTable']",
            pos: "bottomright",
            callback: function(){
                hideSideWrapperInTourMode();
            }
        }),

    ],
}