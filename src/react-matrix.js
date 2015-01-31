class MatrixCell extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			value: this.props.value,
		}
		
		this.activeStyle = {
			border: '1px solid #000',
			display: 'block',
			margin: '2px 0',
			width: '40px'
		}

		this.defaultStyle = {
			border: '1px solid #eee',
			display: 'block',
			margin: '2px 0',
			width: '40px'
		}
	}

	onChange(e) {
		var val = e.target.value;
		this.props.matrix.setCellValue(this.props.x, this.props.y, val);
		this.setState({value: val});
	}

	onClick(e) {
		this.props.matrix.setCell(e.target.selectionStart, this.props.x, this.props.y)
	}

	onKeyDown(e) {
		var dy = 0;
		var dx = 0;
		switch(e.key) {
			case "ArrowUp":
				dy = -1;
				break;
			case "ArrowRight":
				dx = 1;
				break;
			case "ArrowDown":
				dy = 1;
				break;
			case "ArrowLeft":
				dx = -1;
				break;
		}

		this.props.matrix.moveCell(dx, dy);
	}

	focus() {
		var node = this.refs.input.getDOMNode();
		var caretPos = this.props.matrix.state.caret;
		node.focus();
		setTimeout(function() {
			node.setSelectionRange(caretPos, caretPos)
		}, 0);
	}

	componentDidMount() {
		if(this.props.active) this.focus()		
	}

	componentDidUpdate() {
		if(this.props.active) this.focus()
	}

	render() {
		var style = this.defaultStyle;
		if(this.props.active) style = this.activeStyle;
		return (
			<input ref="input" type="text" style={style} value={this.state.value}
				onClick={this.onClick.bind(this)}
				onKeyDown={this.onKeyDown.bind(this)}
				onChange={this.onChange.bind(this)} />	
		);
	}
}

class Matrix extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			x: -1,
			y: -1,
			caret: 0,
			columns: this.props.columns
		}

		this.style = {
			overflow: 'hidden',
			display: 'inline-block',
			borderLeft: '2px solid #333',
			borderRight: '2px solid #333',
			borderRadius: '4px'
		}
	}

	getHeight() {
		return this.state.columns[0].length;
	}

	getWidth() {
		return this.state.columns.length;
	}

	getCellValue(x, y) {
		if(x < 0 || y < 0 || x > this.getWidth()-1 || y > this.getHeight()-1) return '';
		return this.state.columns[x][y];
	}

	setCellValue(x, y, val) {
		var columns = this.state.columns;
		columns[x][y] = val;
		this.setState({
			columns: columns,
		})
	}

	setCell(caret, cellX, cellY) {
		// Remove columns / rows if needed
		this.truncate(cellX, cellY);

		this.setState({
			caret: caret,
			x: cellX,
			y: cellY,
		});
	}

	moveCell(dx, dy) {
		var cellX = this.state.x;
		var caretPos;
		if(this.state.caret+dx > (''+this.getCellValue(cellX, this.state.y)).length) {
			cellX++;
			caretPos = 0; // First pos in next cell
		} else if(this.state.caret+dx < 0) {
			cellX--;
			caretPos = (''+this.getCellValue(cellX, this.state.y)).length;
		} else {
			caretPos = this.state.caret+dx;
		}
		var cellY = this.state.y+dy;

		// Negative position is not allowed
		if(cellX < 0) return;
		if(cellY < 0) return;

		// Remove columns / rows if needed
		this.truncate(cellX, cellY);

		// Add column / row if needed
		if(this.state.x+dx >= this.getWidth()) {
			this.addColumn();
		}
		if(this.state.y+dy >= this.getHeight()) {
			this.addRow();
		}

		this.setState({
			caret: caretPos,
			x: cellX,
			y: cellY
		})
	}

	addRow() {
		var columns = this.state.columns;
		for (var i = 0; i < columns.length; i++) {
			columns[i].push('');
		};
		this.setState({
			height: this.getHeight() + 1,
			columns: columns
		});
	}

	addColumn() {
		var columns = this.state.columns;
		var newColumn = new Array(this.getHeight());
		for (var i = 0; i < newColumn.length; i++) {
			newColumn[i] = ''
		};
		columns.push(newColumn);

		this.setState({
			width: this.state.width + 1,
			columns: columns
		})
	}

	isRowEmpty(row) {
		for (var i = 0; i < this.state.columns.length; i++) {
			var col = this.state.columns[i];
			if((''+col[col.length-1]).length > 0) {
				return false;
			}
		};

		return true;
	}

	isColumnEmpty(col) {
		var column = this.state.columns[col];
		for (var i = 0; i < column.length; i++) {
			if((''+column[i]).length > 0) return false;
		};

		return true;
	}

	removeRow(row) {
		for (var i = 0; i < this.state.columns.length; i++) {
			this.state.columns[i].splice(row, 1)
		};
		this.setState({
			columns: this.state.columns
		})
	}

	removeColumn(col) {
		this.state.columns.splice(col, 1);
		this.setState({
			columns: this.state.columns
		});
	}

	truncate(cellX, cellY) {
		for (var x = this.getWidth()-1; x > cellX; x--) {
			if(this.isColumnEmpty(x)) this.removeColumn(x)
		};
		for (var y = this.getHeight()-1; y > cellY; y--) {
			if(this.isRowEmpty(y)) this.removeRow(y)
		};
	}

	render() {
		var activeCell = this.state.x * this.getHeight() + this.state.y;
		var currentCell = 0;
		var currentCol = 0;

		var x = 0;
		var columns = this.state.columns.map(function(columnValues) {
			var y = 0;
			var column = columnValues.map(function(value) {
				var active = currentCell === activeCell;
				var cell = <MatrixCell key={x+'-'+y} value={value} matrix={this} x={x} y={y} active={active} />
				currentCell++;
				y += 1;
				return cell;
			}, this)
			x += 1

			var columnStyle = {
				float: 'left',
				padding: '3px'
			}

			var col = <div key={x} style={columnStyle}>{column}</div>
			currentCol++;
			return col;
			
		}, this)
		return (
			<div style={this.style}>
				{columns}
			</div>
		);
	}
}
