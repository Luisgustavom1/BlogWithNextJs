/* eslint-disable react/no-array-index-key */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <>
      <Header className="post" />
      <img
        src={post.data.banner.url}
        alt="Banner do post"
        className={styles.img}
      />
      <main className={styles.container}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <section className={commonStyles.description}>
          <span>
            <FiCalendar />
            <p>{post.first_publication_date}</p>
          </span>
          <span>
            <FiUser />
            <p>{post.data.author}</p>
          </span>
          <span>
            <FiClock />
            <p>4min</p>
          </span>
        </section>
        <div className={styles.body}>
          {post.data.content.map((content, id) => (
            <article key={id} className={styles.content}>
              <h2>{content.heading}</h2>
              <p
                dangerouslySetInnerHTML={{ __html: content.body.toString() }}
              />
            </article>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 2 }
  );

  const params = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths: [...params],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', slug.toString(), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'd MMM y',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: RichText.asHtml(content.body),
      })),
    },
  };

  console.log(JSON.stringify(response, null, 2));

  return {
    props: {
      post,
    },
  };
};
