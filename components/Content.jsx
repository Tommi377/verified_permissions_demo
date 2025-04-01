import React from 'react';
import { Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import contentData from '../utils/contentData';
import { useUser } from '@auth0/nextjs-auth0/client';

const Content = () => {
    const { user, isLoading } = useUser();
    console.log(user)
    return (<div className="next-steps my-5" data-testid="content">
        <h2 className="my-5 text-center" data-testid="content-title">
            Content
        </h2>
    </div>)
}

export default Content;
