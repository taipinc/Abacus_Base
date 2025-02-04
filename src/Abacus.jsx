import React, {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {
	Plus,
	Minus,
	ChevronsRight,
	ChevronsLeft,
	RotateCcw,
} from 'lucide-react';

const Abacus = () => {
	const [base, setBase] = useState(10);
	const [rows, setRows] = useState(8);
	const [beadStates, setBeadStates] = useState([]);
	const [value, setValue] = useState(0);

	useEffect(() => {
		const initialBeads = Array(rows)
			.fill()
			.map(() => ({
				rightSide: base - 1,
				leftSide: 0,
			}));
		setBeadStates(initialBeads);
	}, [base, rows]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (['ArrowUp', 'ArrowRight'].includes(e.key)) {
				changeValue(1);
			} else if (['ArrowDown', 'ArrowLeft'].includes(e.key)) {
				changeValue(-1);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [value, base, rows]);

	const updateBeadsFromValue = (newValue) => {
		let remainingValue = newValue;
		const newBeads = [...beadStates];

		newBeads.forEach((row) => {
			row.leftSide = 0;
			row.rightSide = base - 1;
		});

		for (let i = newBeads.length - 1; i >= 0; i--) {
			const placeValue = Math.pow(base, i);
			const digit = Math.floor(remainingValue / placeValue);
			if (digit > 0) {
				newBeads[i].leftSide = Math.min(digit, base - 1);
				newBeads[i].rightSide = base - 1 - newBeads[i].leftSide;
				remainingValue -= digit * placeValue;
			}
		}

		setBeadStates(newBeads);
	};

	const changeValue = (increment) => {
		const placeValue = Math.pow(base, rows - 1);
		const maxValue = placeValue * (base - 1);
		const newValue = Math.max(0, Math.min(value + increment, maxValue));
		setValue(newValue);
		updateBeadsFromValue(newValue);
	};

	const reset = () => {
		setValue(0);
		updateBeadsFromValue(0);
	};

	useEffect(() => {
		let newValue = 0;
		beadStates.forEach((row, rowIndex) => {
			newValue += row.leftSide * Math.pow(base, rowIndex);
		});
		setValue(newValue);
	}, [beadStates, base]);

	const moveBead = (rowIndex, direction, moveAll = false) => {
		const newBeads = [...beadStates];
		const row = newBeads[rowIndex];

		if (direction === 'left') {
			const moveCount = moveAll ? row.rightSide : 1;
			if (row.rightSide >= moveCount) {
				row.leftSide += moveCount;
				row.rightSide -= moveCount;
			}
		} else if (direction === 'right') {
			const moveCount = moveAll ? row.leftSide : 1;
			if (row.leftSide >= moveCount) {
				row.leftSide -= moveCount;
				row.rightSide += moveCount;
			}
		}

		setBeadStates(newBeads);
	};

	const incrementBase = () => setBase((prev) => Math.min(prev + 1, 16));
	const decrementBase = () => {
		const newBase = Math.max(base - 1, 2);
		setBase(newBase);
		setBeadStates((prev) =>
			prev.map((row) => ({
				rightSide: newBase - 1,
				leftSide: 0,
			}))
		);
	};

	return (
		<div className='p-4 max-w-4xl mx-auto bg-amber-300 rounded-2xl shadow-lg m-8'>
			<div className='mb-6 flex items-center gap-6 p-4 bg-white rounded-lg shadow-sm'>
				<div className='flex items-center gap-2'>
					<Button
						onClick={decrementBase}
						disabled={base <= 2}
						variant='outline'
					>
						-
					</Button>
					<div className='flex flex-col items-center'>
						<span className='text-sm text-slate-500'>Base</span>
						<span className='text-2xl font-bold text-slate-700'>{base}</span>
					</div>
					<Button
						onClick={incrementBase}
						disabled={base >= 16}
						variant='outline'
					>
						+
					</Button>
				</div>

				<div className='flex-1 flex items-center gap-4'>
					<div className='flex gap-2 items-center flex-1'>
						<Button
							variant='outline'
							onClick={() => changeValue(-1)}
							disabled={value <= 0}
						>
							<Minus className='h-4 w-4' />
						</Button>
						<div className='flex flex-col items-center'>
							<span className='text-sm text-slate-500'>Value</span>
							<span className='text-2xl font-bold text-slate-800 w-40 text-center'>
								{value}
							</span>
						</div>
						<Button
							variant='outline'
							onClick={() => changeValue(1)}
							disabled={value >= Math.pow(base, rows) - 1}
						>
							<Plus className='h-4 w-4' />
						</Button>
					</div>
				</div>

				<Button
					variant='outline'
					onClick={reset}
					className='flex gap-2 items-center'
				>
					<RotateCcw className='h-4 w-4' />
					Reset
				</Button>
			</div>

			<div className='bg-white p-6 rounded-lg shadow-sm'>
				{beadStates.map((row, rowIndex) => (
					<div
						key={rowIndex}
						className='flex items-center mb-4 gap-2'
					>
						<div className='w-16 text-right text-slate-600'>
							{Math.pow(base, rowIndex)}×
						</div>

						<div className='flex gap-1'>
							<Button
								size='sm'
								variant='outline'
								onClick={() => moveBead(rowIndex, 'left', true)}
								disabled={row.rightSide === 0}
							>
								<ChevronsLeft className='h-4 w-4' />
							</Button>
							<Button
								size='sm'
								variant='outline'
								onClick={() => moveBead(rowIndex, 'left')}
								disabled={row.rightSide === 0}
							>
								<Plus className='h-4 w-4' />
							</Button>
						</div>

						<div className='h-12 bg-slate-100 flex-1 relative flex items-center rounded-lg'>
							<div className='absolute left-0 flex items-center gap-2 p-2'>
								{Array(row.leftSide)
									.fill()
									.map((_, i) => (
										<div
											key={`left-${i}`}
											className='w-8 h-8 rounded-full bg-emerald-500 shadow-md transition-transform duration-100 ease-in-out transform hover:scale-110'
										/>
									))}
							</div>

							<div className='absolute right-0 flex items-center gap-2 p-2'>
								{Array(row.rightSide)
									.fill()
									.map((_, i) => (
										<div
											key={`right-${i}`}
											className='w-8 h-8 rounded-full bg-stone-300 shadow-sm transition-transform duration-100 ease-in-out transform hover:scale-110'
										/>
									))}
							</div>
						</div>

						<div className='flex gap-1'>
							<Button
								size='sm'
								variant='outline'
								onClick={() => moveBead(rowIndex, 'right')}
								disabled={row.leftSide === 0}
							>
								<Minus className='h-4 w-4' />
							</Button>
							<Button
								size='sm'
								variant='outline'
								onClick={() => moveBead(rowIndex, 'right', true)}
								disabled={row.leftSide === 0}
							>
								<ChevronsRight className='h-4 w-4' />
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Abacus;
