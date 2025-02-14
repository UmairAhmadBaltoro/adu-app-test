import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Row, Col, Navbar, Nav, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Chat from './components/Chat';
import ChatFlowDesigner from './pages/ChatFlowDesigner';

function App() {
  const [propertyDetails, setPropertyDetails] = useState(null);

  return (
    <Router>
      <Navbar bg="light" className="mb-3">
        <Nav>
          <Nav.Link as={Link} to="/">Chat</Nav.Link>
          <Nav.Link as={Link} to="/designer">ChatFlow Designer</Nav.Link>
        </Nav>
      </Navbar>
      <Routes>
        <Route exact path="/" element={
          <Container fluid>
            <Row style={{ height: 'calc(100vh - 100px)' }}>
              <Col md={7} className="pb-3">
                <Chat />
              </Col>
              <Col md={5} className="h-100 pb-3">
                <Card className="h-100">
                  <Card.Header>Property Details</Card.Header>
                  <Card.Body className="overflow-auto">
                    {propertyDetails ? (
                      <div>
                        {/* Property details content will go here */}
                        <p>Address: {propertyDetails.address}</p>
                        <p>Zone: {propertyDetails.zone}</p>
                        {/* Add more property details as needed */}
                      </div>
                    ) : (
                      <div className="text-center text-muted">
                        <p>Property details will appear here once available</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        } />
        <Route path="/designer" element={<ChatFlowDesigner />} />
      </Routes>
    </Router>
  );
}

export default App;
