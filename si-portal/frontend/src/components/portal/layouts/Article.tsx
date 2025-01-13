import { Card } from 'react-bootstrap';
import { ArticleProps } from '~types/LayoutTypes';

const Article = ({ title, content }: ArticleProps) => {
  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{content}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Article;
