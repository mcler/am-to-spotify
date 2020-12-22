import { pure } from 'recompose';

import Empty from 'components/Empty';
import TableHeader from './TableHeader';
import TableBody from './TableBody';

import style from './Table.module.css';

function Tracks({ dispatch, tracks, selected }) {
    if (!tracks || !tracks.length) {
        return (
            <Empty>No tracks in library</Empty>
        )
    }

    return (
        <div className={style.table}>
            <TableHeader key="table-header" dispatch={dispatch} tracks={tracks} selected={selected}/>
            <TableBody key="table-body" dispatch={dispatch} tracks={[null, ...tracks]} selected={selected} />
        </div>
    )
}

export default pure(Tracks);
