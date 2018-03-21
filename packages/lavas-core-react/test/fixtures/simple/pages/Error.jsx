import React from 'react';
import PropTypes from 'prop-types';

function Error(props) {
    return (
        <div>
            <p style={{padding: '20px 0',textAlign:'center'}}>{props.errmsg}</p>
        </div>
    );
}

Error.defaultProps = {
    errmsg: 'Oops! Something is not quite right o(╥﹏╥)o'
};
Error.propTypes = {
    errmsg: PropTypes.string
};

export default Error;
