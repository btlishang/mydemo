$(function() {
	var id = -1;
	$('#sub').click(function() {
	
		var name = $('#name').val();
		var ticket = $('#ticketid').val();
	
		var callback = function(data) {
			console.log(data);
		}
		if(name == "" || ticket == "") {
			$('#notice').text('请输入考生姓名与准考证号！');
	
		} else {
	
			$.getJSON("http://210.51.191.181/osrad/api/yst/student/again/login", {
				ticket: ticket,
				name: name
			}, function(result) {
	
				console.log(result);
	
				if(result.code == 1) {
	
					$('#login').hide();
	
					$('#success').show(function() {
	
						$('#people').text(result.student.name);
						$('#region').text(result.student.regionName);
						$('#group').text(result.student.groupName);
						$('#num').text(result.student.phone);
						$('#tticketid').text(result.student.ticket);
					});
					id = result.student.id;
	
				} else if(result.code == 0) {
	
					$('#notice').text('考生号码错误,请重新输入!');
	
				} else if(result.code == -1) {
	
					$('#mes').show();
					$('#login').hide();
	
				}
	
			});
		}
	
	});
	
	function getUuid() {
		var s = [];
		var hexDigits = "0123456789abcdef";
		for(var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";
	
		var uuid = s.join("");
		return uuid;
	}
	
	//待上传的文件队列，包含切块的文件
	var quence = new Array();
	
	/**
	 * 用户选择文件之后的响应函数，将文件信息展示在页面，同时对大文件的切块大小、块的起止进行计算、入列等
	 */
	$('#file').change(function() {
		var file = $('#file')[0].files[0];
		if(!file) {
			return;
		}
	
		quence = new Array();
		
		var audio = document.getElementById("audio");
	
		var src = window.createObjectURL && window.createObjectURL(file) || window.URL && window.URL.createObjectURL(file) || window.webkitURL && window.webkitURL.createObjectURL(file);
	
		audio.src = src;
	
		var tl;
		$("#audio").on("canplay", function() {
			tl = $('#audio').get(0).duration;
	
			$("#progress").val(0);
	
			if(tl > 300) {
				$('#warring').text('音频时长不能超过5分钟');
				$('#warring').show();
				$('#upload').attr('disabled', 'disabled');
				$('#upload').css('background-color', '#8E8E8E');
			} else {
				quence = new Array();
				$('#warring').text('');
				$('#upload').removeAttr('disabled');
				$('#upload').css('background-color', '#fcda21');
				
				$("#progress").val(0);
	
				var chunkSize = 5 * 1024 * 1024; //切块的阀值：5M
				var uuid = getUuid();
				if(file.size > chunkSize) { //文件大于阀值，进行切块
					//切块发送
					var chunks = Math.max(Math.floor(file.size / chunkSize), 1) + 1; //分割块数
					for(var i = 0; i < chunks; i++) {
						var startIdx = i * chunkSize; //块的起始位置
						var endIdx = startIdx + chunkSize; //块的结束位置
						if(endIdx > file.size) {
							endIdx = file.size;
						}
						var lastChunk = false;
						if(i == (chunks - 1)) {
							lastChunk = true;
						}
						//封装成一个task，入列
						var task = {
							file: file,
							uuid: uuid, //避免文件的重名导致服务端无法定位文件，需要给每个文件生产一个UUID
							chunked: true,
							startIdx: startIdx,
							endIdx: endIdx,
							currChunk: i,
							totalChunk: chunks
						}
						quence.push(task);
					}
				} else { //文件小于阀值
	
					var task = {
						file: file,
						uuid: uuid,
						chunked: false
					}
	
					quence.push(task);
	
				}
			}
		});
	
		//上传器，绑定一个XMLHttpRequest对象，处理分配给其的上传任务
		function Uploader(name) {
			this.url = 'http://210.51.191.181/osrad/api/yst/student/' + id + '/video'; //服务端处理url
			this.req = new XMLHttpRequest();
			this.tasks; //任务队列
			this.taskIdx = 0; //当前处理的tasks的下标
			this.name = name;
			this.status = 0; //状态，0：初始；1：所有任务成功；2：异常
	
			//上传 动作
			this.upload = function(uploader) {
				this.req.responseType = "json";
	
				//注册load事件（即一次异步请求收到服务端的响应）
				this.req.addEventListener("load", function() {
					var result = this.response;
					var currChunk = parseInt(result.currChunk) + 1;
					var totalChunk = parseInt(result.totalChunk);
					//更新对应的进度条
					progressUpdate(currChunk, totalChunk);
					//从任务队列中取一个再次发送
					var task = uploader.tasks[currChunk];
					if(task) {
						console.log(uploader.name + "：当前执行的任务编号：" + currChunk);
						this.open("POST", uploader.url);
						this.send(uploader.buildFormData(task));
						uploader.taskIdx++;
					} else {
						console.log("处理完毕");
						quence = new Array();
						uploader.status = 1;
						$('#success').hide();
						$('#mes').show();
					}
				});
	
				//处理第一个
				var task = this.tasks[this.taskIdx];
				if(task) {
					console.log(uploader.name + "：当前执行的任务编号：" + this.taskIdx);
					this.req.open("POST", this.url);
					this.req.send(this.buildFormData(task));
					this.taskIdx++;
				} else {
					uploader.status = 1;
				}
			}
	
			//提交任务
			this.submit = function(tasks) {
				this.tasks = tasks;
			}
	
			//构造表单数据
			this.buildFormData = function(task) {
				var file = task.file;
				var formData = new FormData();
				formData.append("fileName", file.name);
				formData.append("fileSize", file.size);
				formData.append("uuid", task.uuid);
				var chunked = task.chunked;
				if(chunked) { //分块
					formData.append("chunked", task.chunked);
					formData.append("data", file.slice(task.startIdx, task.endIdx)); //截取文件块
					formData.append("currChunk", task.currChunk);
					formData.append("totalChunk", task.totalChunk);
				} else {
					formData.append("data", file);
				}
				return formData;
			}
		}
	
		function progressUpdate(currChunk, totalChunk) {
			if(!isNaN(currChunk) && !isNaN(totalChunk)) {
				$("#progress").val((currChunk / totalChunk * 100));
			}
		}
	
		/**
		 *用户点击“上传”按钮
		 */
		$('#upload').click(function() {
			//创建4个Uploader上传器（4条线程）
			var uploader0 = new Uploader("uploader0");
			var task0 = new Array();
	
//			var uploader1 = new Uploader("uploader1");
//			var task1 = new Array();
//	
//			var uploader2 = new Uploader("uploader2");
//			var task2 = new Array();
//	
//			var uploader3 = new Uploader("uploader3");
//			var task3 = new Array();
	
			//将文件列表取模hash，分配给4个上传器
			for(var i = 0; i < quence.length; i++) {
				//            if(i%4==0) {
				//                task0.push(quence[i]);
				//            }else if(i%4==1) {
				//                task1.push(quence[i]);
				//            }else if(i%4==2) {
				//                task2.push(quence[i]);
				//            }else if(i%4==3) {
				//                task3.push(quence[i]);
				//            }
				task0.push(quence[i]);
			}
			//提交任务，启动线程上传
			uploader0.submit(task0);
			uploader0.upload(uploader0);
			//       uploader1.submit(task1);
			//       uploader1.upload(uploader1);
			//       uploader2.submit(task2);
			//       uploader2.upload(uploader2);
			//       uploader3.submit(task3);
			//       uploader3.upload(uploader3);
	
			//注册一个定时任务，每2秒监控文件是否都上传完毕
			//       uploadCompleteMonitor = setInterval("uploadComplete()",2000);
		});
	
	});
});