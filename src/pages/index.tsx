/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { GetStaticProps } from 'next';
import { useState } from 'react';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiUser, FiCalendar } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [showMorePosts, setShowMorePosts] = useState(false);
  const [morePosts, setMorePosts] = useState<Post[]>([]);

  function getMorePosts(): void {
    fetch(postsPagination.next_page)
      .then(res => res.json())
      .then(data => setMorePosts(data));
  }

  function handleClick(): void {
    getMorePosts();
    setShowMorePosts(true);
  }

  return (
    <>
      <Header className="home" />
      <main className={commonStyles.main}>
        {postsPagination.results.map(post => (
          <a className={styles.post} key={post.uid}>
            <h1 className={styles.title}>{post.data.title}</h1>
            <p className={styles.subtitle}>{post.data.subtitle}</p>
            <footer className={commonStyles.authorAndDate}>
              <span>
                <FiCalendar />
                <p>{post.first_publication_date}</p>
              </span>
              <span>
                <FiUser />
                <p>{post.data.author}</p>
              </span>
            </footer>
          </a>
        ))}
        {postsPagination.next_page && !showMorePosts && (
          <p className={styles.maisPosts} onClick={() => handleClick()}>
            Carregar mais posts
          </p>
        )}
        {morePosts.map(post => (
          <a className={styles.post} key={post.uid}>
            <h1 className={styles.title}>{post.data.title}</h1>
            <p className={styles.subtitle}>{post.data.subtitle}</p>
            <footer className={commonStyles.description}>
              <span>
                <FiCalendar />
                <p>{post.first_publication_date}</p>
              </span>
              <span>
                <FiUser />
                <p>{post.data.author}</p>
              </span>
            </footer>
          </a>
        ))}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 2,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'd MMM y',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
