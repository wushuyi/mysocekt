(function($){

	var gData;

	var PIXI = window.PIXI || {};
	/**
	 * @author Mat Groves http://matgroves.com/ @Doormat23
	 */

	/**
	 * Creates a Canvas element of the given size.
	 *
	 * @class CanvasBuffer
	 * @constructor
	 * @param width {Number} the width for the newly created canvas
	 * @param height {Number} the height for the newly created canvas
	 */
	PIXI.CanvasBuffer = function(width, height)
	{
		/**
		 * The width of the Canvas in pixels.
		 *
		 * @property width
		 * @type Number
		 */
		this.width = width;

		/**
		 * The height of the Canvas in pixels.
		 *
		 * @property height
		 * @type Number
		 */
		this.height = height;

		/**
		 * The Canvas object that belongs to this CanvasBuffer.
		 *
		 * @property canvas
		 * @type HTMLCanvasElement
		 */
		this.canvas = document.createElement("canvas");

		/**
		 * A CanvasRenderingContext2D object representing a two-dimensional rendering context.
		 *
		 * @property context
		 * @type CanvasRenderingContext2D
		 */
		this.context = this.canvas.getContext("2d");

		this.canvas.width = width;
		this.canvas.height = height;
	};

	PIXI.CanvasBuffer.prototype.constructor = PIXI.CanvasBuffer;

	/**
	 * Clears the canvas that was created by the CanvasBuffer class.
	 *
	 * @method clear
	 * @private
	 */
	PIXI.CanvasBuffer.prototype.clear = function()
	{
		this.context.clearRect(0,0, this.width, this.height);
	};

	/**
	 * Resizes the canvas to the specified width and height.
	 *
	 * @method resize
	 * @param width {Number} the new width of the canvas
	 * @param height {Number} the new height of the canvas
	 */
	PIXI.CanvasBuffer.prototype.resize = function(width, height)
	{
		this.width = this.canvas.width = width;
		this.height = this.canvas.height = height;
	};


	$(document).ready(function ($){
		initSocket();
		initCanvas();
	});

	function initSocket(){
		var socket = io();

		window.socket = socket;

		socket.on('connect', function () {
			socket.emit('getSocketId');
		});

		socket.on('msgToSome', function(data){
			console.log(data);
		});

		socket.on('getSocketId', function(data){
			console.log(data);
		});

		socket.on('getSocketRoom', function(data){
			console.log(data);
		});
	}

	function initCanvas(){
		var boardCtl = {};

		var canvasBuff = new PIXI.CanvasBuffer(800, 600);
		var canvas = canvasBuff.canvas;
		var ctx = canvasBuff.context;
		$('.canvas').append(canvas);
		var $canvas = $(canvas);
		$canvas.on('contextmenu', function(ev){
			ev.preventDefault();
		});
		$canvas.on('mousedown', function(ev){
			if(ev.originalEvent.button === 2){
				return false;
			}
			var point = {
				x: ev.offsetX,
				y: ev.offsetY
			};
			penOnDown(point);
		});
		$canvas.on('mousemove', function(ev){
			var point = {
				x: ev.offsetX,
				y: ev.offsetY
			};
			penOnMove(point);
		});
		$canvas.on('mouseup mouseleave', function(ev){
			var point = {
				x: ev.offsetX,
				y: ev.offsetY
			};
			penOnUp(point);
		});

		socket.on('board', function (data) {
			if (data.length) {
				var fpsBuff = [];
				var looprun;

				var loopPush = function () {
					fpsBuff = data[0];
					_.forEach(fpsBuff, function (data, key) {
						switch (data.m) {
							case 1:
								penOnDown(data, true);
								break;
							case 2:
								penOnMove(data, true);
								break;
							case 3:
								penOnUp(data, true);
								break;
						}
					});
					data = _.rest(data);
					looprun = window.requestAnimationFrame(loopPush);
				};
				looprun = window.requestAnimationFrame(loopPush);
			}
		});

		var moveBuff = [];
		var fpsBuff= [];
		var moveLock = false;
		var looprun;

		var loopPush = function(){
			//ctx.stroke();
			moveBuff.push(fpsBuff);
			fpsBuff = [];
			looprun = window.requestAnimationFrame(loopPush);
		};

		function penOnDown(point, isRemote){
			boardCtl.isDown = true;
			boardCtl.drawType = 'pen';
			ctx.beginPath();
			ctx.moveTo(point.x, point.y);
			ctx.lineTo(point.x + 1, point.y + 1);
			ctx.stroke();
			if(!isRemote){
				point.m = 1;
				moveBuff.push([
					point
				]);
			}
		}

		function penOnMove(point, isRemote){
			if(isRemote){
				//console.log(point);
			}
			if(!(boardCtl.isDown || boardCtl.drawType === 'pen')){
				//console.log('run');
				return false;
			}
			ctx.lineTo(point.x, point.y);
			ctx.stroke();

			if(!isRemote){
				point.m = 2;
				fpsBuff.push(point);
				if(!moveLock){
					moveLock = true;
					looprun = window.requestAnimationFrame(loopPush);
				}
			}
		}

		function penOnUp(point, isRemote){
			if(!boardCtl.isDown){
				return false;
			}
			window.cancelAnimationFrame(looprun);
			fpsBuff= [];
			moveLock = false;
			//console.log(moveBuff);
			boardCtl.isDown = false;
			boardCtl.drawType = null;
			ctx.closePath();
			if(!isRemote) {
				point.m = 3;
				moveBuff.push([
					point
				]);
				socket.emit('board', moveBuff);
				moveBuff = [];
			}
		}
	}
})(window.jQuery);